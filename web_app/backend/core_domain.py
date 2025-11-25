"""
Core Domain Package (Python) - Backend Import
Temporary bridge until proper package structure is set up
"""

import sys
import os

# Add packages to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../packages/core-domain/python"))

from __init__ import (
    ResonanceSummary,
    getResonanceSummaryForUser,
    SoulmatesEvent,
    SoulmatesEventName,
    logSoulmatesEvent,
)

__all__ = [
    "ResonanceSummary",
    "getResonanceSummaryForUser",
    "SoulmatesEvent",
    "SoulmatesEventName",
    "logSoulmatesEvent",
]

