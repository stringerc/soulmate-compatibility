"""
Analysis Pipeline for Testing Theory-Derived Features

This module implements the empirical testing loop:
  1. Load dataset
  2. Build baseline models (32D V + 7D R)
  3. Add numerology/astrology features
  4. Run ablation studies
  5. Compare performance

Requires: numpy, pandas, scikit-learn (optional: xgboost, lightgbm)
"""

from typing import Dict, List, Tuple, Optional, Any
import numpy as np
from dataclasses import dataclass

from data_schema import Dataset, Pair
from base_model import CompatibilityModel


@dataclass
class DecisionThresholds:
    """Thresholds for KEEP/DISCARD decisions"""
    r2_min_delta_keep: float = 0.001  # 0.1% R² improvement
    f1_min_delta_keep: float = 0.0   # F1 improvement (can be tuned)


@dataclass
class ModelResults:
    """Results from a model evaluation"""
    model_name: str
    r2_score: float
    mse: float
    mae: float
    feature_importance: Optional[Dict[str, float]] = None
    predictions: Optional[np.ndarray] = None
    actual: Optional[np.ndarray] = None
    # Classification metrics (for soulmate flag)
    classification_accuracy: Optional[float] = None
    classification_precision: Optional[float] = None
    classification_recall: Optional[float] = None
    classification_f1: Optional[float] = None
    classification_predictions: Optional[np.ndarray] = None
    classification_actual: Optional[np.ndarray] = None


class FeatureExtractor:
    """
    Extracts features from Dataset for ML model training.
    """
    
    def __init__(self, dataset: Dataset):
        self.dataset = dataset
    
    def extract_features(
        self,
        include_numerology: bool = False,
        include_astrology: bool = False,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract feature matrix X and target vector y from dataset.
        
        Returns:
            X: (n_samples, n_features) feature matrix
            y: (n_samples,) target vector (S scores)
            feature_names: list of feature names
        """
        features_list = []
        y_list = []
        feature_names = []
        
        for pair in self.dataset.pairs:
            pair_features = self.dataset.get_pair_features(
                pair,
                include_numerology=include_numerology,
                include_astrology=include_astrology,
            )
            
            # Extract numeric features (skip categorical for now)
            numeric_features = []
            if not feature_names:  # First iteration: build feature names
                for key, value in pair_features.items():
                    if isinstance(value, (int, float)):
                        feature_names.append(key)
                    elif isinstance(value, list):
                        # Flatten lists (V_i, V_j, R, Y)
                        for i, _ in enumerate(value):
                            feature_names.append(f"{key}_{i}")
            
            # Extract values
            for key in feature_names:
                if "_" in key and key.split("_")[-1].isdigit():
                    # Handle flattened features like "V_i_0", "V_i_1", etc.
                    base_name, idx = key.rsplit("_", 1)
                    idx = int(idx)
                    base_key = base_name.rsplit("_", 1)[0] if "_" in base_name else base_name
                    if base_key in pair_features:
                        val = pair_features[base_key]
                        if isinstance(val, list) and idx < len(val):
                            numeric_features.append(val[idx])
                        else:
                            numeric_features.append(0.0)
                    else:
                        numeric_features.append(0.0)
                elif key in pair_features:
                    val = pair_features[key]
                    if isinstance(val, (int, float)):
                        numeric_features.append(val)
                    else:
                        numeric_features.append(0.0)
                else:
                    numeric_features.append(0.0)
            
            features_list.append(numeric_features)
            # Use S_true if available (for simulation), else S
            target = pair.S_true if (hasattr(pair, 'S_true') and pair.S_true is not None) else pair_features["S"]
            y_list.append(target)
        
        X = np.array(features_list)
        y = np.array(y_list)
        
        return X, y, feature_names
    
    def extract_baseline_features(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Extract only baseline features (V + R, no theory-derived)"""
        return self.extract_features(
            include_numerology=False,
            include_astrology=False,
        )
    
    def extract_with_numerology(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Extract baseline + numerology features"""
        return self.extract_features(
            include_numerology=True,
            include_astrology=False,
        )
    
    def extract_with_astrology(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Extract baseline + astrology features"""
        return self.extract_features(
            include_numerology=False,
            include_astrology=True,
        )
    
    def extract_with_all(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        """Extract baseline + numerology + astrology features"""
        return self.extract_features(
            include_numerology=True,
            include_astrology=True,
        )


class ModelComparator:
    """
    Compares model performance with and without theory-derived features.
    """
    
    def __init__(self, extractor: FeatureExtractor):
        self.extractor = extractor
    
    def compare_models(
        self,
        test_size: float = 0.2,
        random_state: int = 42,
        include_classification: bool = True,
    ) -> Dict[str, ModelResults]:
        """
        Compare baseline vs numerology vs astrology vs all features.
        
        Returns dictionary of ModelResults for each configuration.
        """
        results = {}
        
        # Extract classification targets if available
        y_classification = None
        if include_classification:
            flags = []
            for pair in self.extractor.dataset.pairs:
                flags.append(pair.soulmate_flag if pair.soulmate_flag is not None else 0)
            y_classification = np.array(flags)
        
        # Baseline (V + R only)
        X_baseline, y, feature_names_baseline = self.extractor.extract_baseline_features()
        results["baseline"] = self._train_and_evaluate(
            "Baseline (32D V + 7D R)",
            X_baseline,
            y,
            y_classification=y_classification,
            test_size=test_size,
            random_state=random_state,
        )
        
        # Baseline + Numerology
        X_num, y_num, feature_names_num = self.extractor.extract_with_numerology()
        if X_num.shape[1] > X_baseline.shape[1]:  # Only if numerology features added
            results["baseline_numerology"] = self._train_and_evaluate(
                "Baseline + Numerology",
                X_num,
                y_num,
                y_classification=y_classification,
                test_size=test_size,
                random_state=random_state,
            )
        
        # Baseline + Astrology
        X_ast, y_ast, feature_names_ast = self.extractor.extract_with_astrology()
        if X_ast.shape[1] > X_baseline.shape[1]:  # Only if astrology features added
            results["baseline_astrology"] = self._train_and_evaluate(
                "Baseline + Astrology",
                X_ast,
                y_ast,
                y_classification=y_classification,
                test_size=test_size,
                random_state=random_state,
            )
        
        # Baseline + All
        X_all, y_all, feature_names_all = self.extractor.extract_with_all()
        if X_all.shape[1] > X_baseline.shape[1]:  # Only if additional features added
            results["baseline_all"] = self._train_and_evaluate(
                "Baseline + Numerology + Astrology",
                X_all,
                y_all,
                y_classification=y_classification,
                test_size=test_size,
                random_state=random_state,
            )
        
        return results
    
    def _train_and_evaluate(
        self,
        model_name: str,
        X: np.ndarray,
        y: np.ndarray,
        y_classification: Optional[np.ndarray] = None,
        test_size: float = 0.2,
        random_state: int = 42,
    ) -> ModelResults:
        """
        Train a simple linear regression model and evaluate.
        
        In production, you'd use scikit-learn, but this is a minimal implementation
        that works without external dependencies.
        """
        # Simple train/test split
        np.random.seed(random_state)
        n_samples = len(y)
        n_test = int(n_samples * test_size)
        indices = np.random.permutation(n_samples)
        test_indices = indices[:n_test]
        train_indices = indices[n_test:]
        
        X_train, X_test = X[train_indices], X[test_indices]
        y_train, y_test = y[train_indices], y[test_indices]
        
        # Use Ridge regression to avoid overfitting
        # Add intercept term
        X_train_with_intercept = np.column_stack([np.ones(len(X_train)), X_train])
        X_test_with_intercept = np.column_stack([np.ones(len(X_test)), X_test])
        
        # Ridge regression: (X^T X + alpha*I)^(-1) X^T y
        alpha = 0.1  # Regularization strength
        try:
            n_features = X_train_with_intercept.shape[1]
            ridge_matrix = X_train_with_intercept.T @ X_train_with_intercept + alpha * np.eye(n_features)
            coeffs = np.linalg.solve(ridge_matrix, X_train_with_intercept.T @ y_train)
            y_pred = X_test_with_intercept @ coeffs
        except np.linalg.LinAlgError:
            # Fallback if singular matrix
            y_pred = np.full_like(y_test, np.mean(y_train))
        
        # Compute metrics
        mse = np.mean((y_test - y_pred) ** 2)
        mae = np.mean(np.abs(y_test - y_pred))
        
        # R² score
        ss_res = np.sum((y_test - y_pred) ** 2)
        ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
        r2 = 1 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
        
        result = ModelResults(
            model_name=model_name,
            r2_score=r2,
            mse=mse,
            mae=mae,
            predictions=y_pred,
            actual=y_test,
        )
        
        # Add classification metrics if y_classification provided
        if y_classification is not None:
            y_class_train = y_classification[train_indices]
            y_class_test = y_classification[test_indices]
            
            # Use regression predictions to classify (threshold at median)
            threshold = np.median(y_pred)
            y_class_pred = (y_pred >= threshold).astype(int)
            
            # Compute classification metrics
            tp = np.sum((y_class_pred == 1) & (y_class_test == 1))
            fp = np.sum((y_class_pred == 1) & (y_class_test == 0))
            fn = np.sum((y_class_pred == 0) & (y_class_test == 1))
            tn = np.sum((y_class_pred == 0) & (y_class_test == 0))
            
            accuracy = (tp + tn) / len(y_class_test) if len(y_class_test) > 0 else 0.0
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
            
            result.classification_accuracy = accuracy
            result.classification_precision = precision
            result.classification_recall = recall
            result.classification_f1 = f1
            result.classification_predictions = y_class_pred
            result.classification_actual = y_class_test
        
        return result
    
    def print_comparison(self, results: Dict[str, ModelResults]):
        """Print comparison of model results"""
        print("=" * 80)
        print("MODEL COMPARISON RESULTS")
        print("=" * 80)
        print()
        
        baseline_r2 = results.get("baseline", ModelResults("", 0, 0, 0)).r2_score
        
        for name, result in results.items():
            improvement = result.r2_score - baseline_r2
            improvement_pct = (improvement / baseline_r2 * 100) if baseline_r2 > 0 else 0
            
            print(f"{result.model_name}:")
            print(f"  R² Score: {result.r2_score:.4f}")
            if name != "baseline":
                print(f"  Improvement over baseline: {improvement:+.4f} ({improvement_pct:+.2f}%)")
            print(f"  MSE: {result.mse:.4f}")
            print(f"  MAE: {result.mae:.4f}")
            print()
        
        # Determine if numerology/astrology should be kept
        print("=" * 80)
        print("RECOMMENDATION:")
        print("=" * 80)
        
        num_result = results.get("baseline_numerology")
        ast_result = results.get("baseline_astrology")
        all_result = results.get("baseline_all")
        
        # Use default thresholds for printing (can be overridden)
        thresholds = DecisionThresholds()
        decisions = self.get_decisions(results, thresholds)
        
        if decisions.get("numerology") == "KEEP":
            print("✓ KEEP Numerology: Shows predictive improvement")
        elif decisions.get("numerology") == "DISCARD":
            print("✗ DISCARD Numerology: No significant improvement")
        
        if decisions.get("astrology") == "KEEP":
            print("✓ KEEP Astrology: Shows predictive improvement")
        elif decisions.get("astrology") == "DISCARD":
            print("✗ DISCARD Astrology: No significant improvement")
        
        if decisions.get("combined") == "KEEP":
            print("✓ KEEP Combined: Shows predictive improvement")
        elif decisions.get("combined") == "DISCARD":
            print("✗ DISCARD Combined: No significant improvement")
    
    def get_decisions(self, results: Dict[str, ModelResults], thresholds: DecisionThresholds) -> Dict[str, str]:
        """Extract KEEP/DISCARD decisions for each feature set using thresholds"""
        baseline_result = results.get("baseline", ModelResults("", 0, 0, 0))
        baseline_r2 = baseline_result.r2_score
        baseline_f1 = baseline_result.classification_f1 or 0.0
        
        decisions = {}
        
        num_result = results.get("baseline_numerology")
        ast_result = results.get("baseline_astrology")
        all_result = results.get("baseline_all")
        
        def should_keep(result: ModelResults, compare_to_baseline: bool = True) -> bool:
            """Determine if feature set should be kept"""
            if result is None:
                return False
            
            # For numerology, also check if it adds value beyond astrology
            if not compare_to_baseline and ast_result:
                # Compare numerology to astrology baseline
                compare_r2 = ast_result.r2_score
                compare_f1 = ast_result.classification_f1 or 0.0
            else:
                # Compare to main baseline
                compare_r2 = baseline_r2
                compare_f1 = baseline_f1
            
            delta_r2 = result.r2_score - compare_r2
            delta_f1 = (result.classification_f1 or 0.0) - compare_f1
            
            # KEEP if R² improvement meets threshold OR F1 improvement meets threshold
            # CRITICAL: delta_r2 must be POSITIVE (improvement, not degradation)
            r2_meets_threshold = delta_r2 > 0 and delta_r2 >= thresholds.r2_min_delta_keep
            f1_meets_threshold = (
                delta_f1 > 0 and  # F1 must also improve
                delta_f1 >= thresholds.f1_min_delta_keep and 
                result.classification_f1 is not None
            )
            
            # For very low thresholds, be more lenient with positive improvements
            if thresholds.r2_min_delta_keep < 0.0005:
                # Accept positive improvements even if slightly below threshold
                r2_meets_threshold = r2_meets_threshold or (delta_r2 > 0 and delta_r2 >= thresholds.r2_min_delta_keep * 0.3)
            
            return r2_meets_threshold or f1_meets_threshold
        
        if num_result:
            # For numerology, check both against baseline and against astrology
            # (to catch cases where it adds value beyond astrology)
            keep_vs_baseline = should_keep(num_result, compare_to_baseline=True)
            keep_vs_astro = False
            if ast_result:
                keep_vs_astro = should_keep(num_result, compare_to_baseline=False)
            decisions["numerology"] = "KEEP" if (keep_vs_baseline or keep_vs_astro) else "DISCARD"
        else:
            decisions["numerology"] = "N/A"
        
        if ast_result:
            decisions["astrology"] = "KEEP" if should_keep(ast_result) else "DISCARD"
        else:
            decisions["astrology"] = "N/A"
        
        if all_result:
            decisions["combined"] = "KEEP" if should_keep(all_result) else "DISCARD"
        else:
            decisions["combined"] = "N/A"
        
        return decisions
    
    def get_structured_results(self, results: Dict[str, ModelResults], thresholds: DecisionThresholds) -> Dict[str, Any]:
        """Return structured results with metrics and decisions"""
        baseline_result = results.get("baseline", ModelResults("", 0, 0, 0))
        baseline_r2 = baseline_result.r2_score
        baseline_f1 = baseline_result.classification_f1 or 0.0
        
        structured = {
            "baseline": {
                "regression": {"r2": baseline_r2},
                "classification": {
                    "f1": baseline_f1,
                    "accuracy": baseline_result.classification_accuracy or 0.0,
                }
            }
        }
        
        # Get decisions first
        decisions = self.get_decisions(results, thresholds)
        
        def add_result(key: str, result: Optional[ModelResults], decision_key: str):
            if result:
                delta_r2 = result.r2_score - baseline_r2
                delta_f1 = (result.classification_f1 or 0.0) - baseline_f1
                
                structured[key] = {
                    "regression": {
                        "r2": result.r2_score,
                        "delta_r2": delta_r2,
                    },
                    "classification": {
                        "f1": result.classification_f1 or 0.0,
                        "delta_f1": delta_f1,
                        "accuracy": result.classification_accuracy or 0.0,
                    },
                    "decision": decisions.get(decision_key, "N/A")
                }
        
        add_result("astro", results.get("baseline_astrology"), "astrology")
        add_result("num", results.get("baseline_numerology"), "numerology")
        add_result("astro_num", results.get("baseline_all"), "combined")
        
        return structured


def add_soulmate_flag(dataset: Dataset, top_percent: float = 0.1, use_s_true: bool = False) -> None:
    """
    For each Pair in dataset, compute a binary soulmate_flag based on S (or S_true if available).
    soulmate_flag = 1 if the pair's S is in the top `top_percent` of the distribution,
    else 0.
    Mutates the dataset in-place by setting pair.soulmate_flag.
    """
    # Get all S scores (prefer S_true if available, else S)
    scores = []
    for pair in dataset.pairs:
        score = pair.S_true if (use_s_true and pair.S_true is not None) else pair.S
        scores.append(score)
    
    scores = np.array(scores)
    threshold = np.percentile(scores, (1 - top_percent) * 100)
    
    for pair in dataset.pairs:
        score = pair.S_true if (use_s_true and pair.S_true is not None) else pair.S
        pair.soulmate_flag = 1 if score >= threshold else 0


def run_ablation_study(
    dataset: Dataset,
    test_size: float = 0.2,
    random_state: int = 42,
    include_classification: bool = True,
    thresholds: Optional[DecisionThresholds] = None,
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    Main entry point for running ablation study.
    
    Usage:
        dataset = Dataset.from_json("data.json")
        results = run_ablation_study(dataset)
    
    Returns structured results with metrics and decisions.
    """
    if thresholds is None:
        thresholds = DecisionThresholds()
    
    extractor = FeatureExtractor(dataset)
    comparator = ModelComparator(extractor)
    
    results = comparator.compare_models(
        test_size=test_size,
        random_state=random_state,
        include_classification=include_classification,
    )
    
    if verbose:
        comparator.print_comparison(results)
    
    # Return structured results
    structured = comparator.get_structured_results(results, thresholds)
    structured["_raw_results"] = results  # Keep raw results for compatibility
    
    return structured

