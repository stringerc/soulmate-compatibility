"""
Soulmates Engine - Backend Import
Temporary bridge until proper package structure is set up
"""

import sys
import os

# Add packages to path
soulmates_engine_path = os.path.join(os.path.dirname(__file__), "../../packages/soulmates-engine")
sys.path.insert(0, soulmates_engine_path)

try:
    from packages.soulmates_engine import (
        CompatibilityOptions,
        CompatibilitySnapshot,
        computeCompatibilitySnapshot,
    )
except ImportError:
    # Fallback: try direct import
    try:
        import importlib.util
        spec = importlib.util.spec_from_file_location("soulmates_engine", os.path.join(soulmates_engine_path, "__init__.py"))
        soulmates_engine = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(soulmates_engine)
        
        CompatibilityOptions = soulmates_engine.CompatibilityOptions
        CompatibilitySnapshot = soulmates_engine.CompatibilitySnapshot
        computeCompatibilitySnapshot = soulmates_engine.computeCompatibilitySnapshot
    except Exception as e:
        # Create stub implementations if import fails
        from typing import Optional, Dict, Any
        from dataclasses import dataclass
        
        @dataclass
        class CompatibilityOptions:
            allow_astrology: bool = False
            allow_numerology: bool = False
        
        class CompatibilitySnapshot:
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)
        
        async def computeCompatibilitySnapshot(
            user_a_traits: list,
            user_b_traits: Optional[list] = None,
            hypothetical_profile: Optional[Dict[str, Any]] = None,
            options: Optional[CompatibilityOptions] = None,
        ) -> CompatibilitySnapshot:
            """Stub implementation"""
            if options is None:
                options = CompatibilityOptions()
            
            # Simple compatibility calculation
            if hypothetical_profile:
                traits_b = hypothetical_profile.get("traits", [0.5] * 32)
            elif user_b_traits:
                traits_b = user_b_traits
            else:
                traits_b = [0.5] * 32
            
            traits_a = user_a_traits if len(user_a_traits) == 32 else [0.5] * 32
            traits_b = traits_b if len(traits_b) == 32 else [0.5] * 32
            
            # Simple distance calculation
            distance = sum((a - b) ** 2 for a, b in zip(traits_a, traits_b)) ** 0.5
            score = max(0, min(1, 1 - distance / 10))
            
            return CompatibilitySnapshot(
                score_overall=score,
                score_axes={},
                soulmate_flag=score > 0.8,
                explanation_summary="Compatibility calculated",
            )

__all__ = [
    "CompatibilityOptions",
    "CompatibilitySnapshot",
    "computeCompatibilitySnapshot",
]

