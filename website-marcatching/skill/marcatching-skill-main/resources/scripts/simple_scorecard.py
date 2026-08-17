#!/usr/bin/env python3
"""Simple Marcatching scorecard helper.

Usage:
python simple_scorecard.py marketing
python simple_scorecard.py content
python simple_scorecard.py safety
python simple_scorecard.py brand
"""

import sys

scorecards = {
    "marketing": [
        "Audience Fit", "Product Specificity", "Differentiation", "Emotional Precision",
        "Proof Safety", "Copy Sharpness", "Cognitive Ease", "CTA Logic",
        "Non-Generic Quality", "Brand Voice Fit"
    ],
    "content": [
        "Audience Relevance", "FYP Potential", "Hook Strength", "Retention Logic",
        "Story Clarity", "Content Originality", "Platform Fit", "Share/Save Trigger",
        "Fact Safety", "Naturalness"
    ],
    "safety": [
        "Claim Accuracy", "Source Quality", "Misleading Risk", "Nuance Preservation",
        "Medical/Legal/Financial Safety", "Disclaimer Fit", "Audience Interpretation Risk",
        "Publish Readiness"
    ],
    "brand": [
        "Positioning Fit", "Voice Fit", "Offer Fit", "Audience Fit",
        "Proof Fit", "Differentiation", "Consistency"
    ]
}

kind = sys.argv[1] if len(sys.argv) > 1 else "marketing"
criteria = scorecards.get(kind, scorecards["marketing"])

print(f"# {kind.title()} Scorecard")
print("| Criteria | Score | Notes |")
print("|---|---:|---|")
for c in criteria:
    print(f"| {c} | /10 | |")
