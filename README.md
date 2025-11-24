# Soulmate Compatibility Framework

A rigorous computational framework for evaluating theories about romantic compatibility ("soulmates") using 32-dimensional trait analysis.

## 🚀 Live Application

**Web App**: [soulmate.syncscript.app](https://soulmate.syncscript.app)

## 📁 Project Structure

```
.
├── web_app/              # Web application
│   ├── frontend/         # Next.js frontend (Vercel)
│   └── backend/          # FastAPI backend (Render)
├── base_model.py         # Core compatibility model
├── theory_evaluator.py   # Theory evaluation framework
├── analysis.py           # Ablation studies and analysis
├── simulation_soulmates.py  # Simulation framework
└── data_schema.py        # Data structures
```

## 🧪 Research Components

- **Theory Evaluation**: Operationalize and test compatibility theories
- **Simulation Framework**: Test model accuracy with synthetic data
- **Ablation Studies**: Determine which features matter
- **100% Detection Accuracy**: Optimized thresholds for theory detection

## 🛠️ Development

### Web Application

See `web_app/README.md` for frontend and backend setup.

### Research Framework

```bash
# Run simulations
python simulation_soulmates.py

# Generate sample data
python generate_sample_data.py

# Evaluate theories
python theory_examples.py
```

## 📊 Results

- **Theory Detection**: 100% accuracy in simulation
- **Soulmate Classification**: F1 scores 0.33-0.55
- **Optimized Thresholds**: R²=0.0005, F1=0.005

## 📚 Documentation

- `DEPLOYMENT_STRATEGY.md` - Deployment approach
- `DEPLOYMENT_GUIDE.md` - Step-by-step guide
- `FINAL_OPTIMIZATION_RESULTS.md` - Research results
- `PIPELINE_README.md` - Usage guide

## License

MIT
