"""Prompt template and scope resolution for Ask IGNIS (Task D.4 | PRD v1.1 §19.3, §19.5)."""

import re
from typing import Any


SYSTEM_PROMPT = """You are IGNIS, the Intelligent Guidance for NASA Ignition Studies assistant.
You provide evidence-grounded scientific explanations regarding microgravity combustion,
spacecraft fire safety, and material flammability in space environments.

STRICT SCIENTIFIC GUIDELINES:
1. Ground every empirical claim in the provided NASA flight evidence chunks.
2. Separate observed telemetry facts from hypothetical extrapolations.
3. If the evidence does not support an assertion, explicitly acknowledge the lack of data.
4. Do not speculate on unverified astronaut flight procedures.
5. All citations must reference the provided NASA investigation names.
"""


def sanitize_input(user_text: str) -> str:
    """Sanitizes user input against prompt injection techniques (PRD v1.1 §19.5)."""
    # Strip potential delimiter hijack attempts
    sanitized = re.sub(r"```(json|markdown|system)?", "", user_text)
    # Remove obvious instruction override prefixes
    sanitized = re.sub(
        r"(ignore\s+(all\s+)?(previous|prior)\s+instructions|system\s+prompt\s*:)",
        "[REDACTED_OVERRIDE_ATTEMPT]",
        sanitized,
        flags=re.IGNORECASE,
    )
    return sanitized.strip()


def build_rag_prompt(
    question: str,
    chunks: list[dict[str, Any]],
    scope: str = "global",
    scenario_context: dict[str, Any] | None = None,
) -> str:
    """Constructs the structured prompt for grounded synthesis."""
    clean_question = sanitize_input(question)

    evidence_context = []
    for i, c in enumerate(chunks, 1):
        evidence_context.append(
            f"[Source {i}] Experiment: {c.get('experiment_title', 'NASA Flight Record')} | "
            f"Evidence Level: {c.get('evidence_level', 'B')}\n"
            f"Excerpt: {c.get('content', '')}\n"
        )

    context_str = "\n".join(evidence_context) if evidence_context else "No direct flight chunks found."

    scenario_str = ""
    if scenario_context:
        scenario_str = (
            f"\nACTIVE SCENARIO CONTEXT:\n"
            f"- Destination / Gravity: {scenario_context.get('gravity_environment', 'microgravity')}\n"
            f"- Oxygen Concentration: {scenario_context.get('oxygen_pct', 21.0)}%\n"
            f"- Atmospheric Pressure: {scenario_context.get('pressure_kpa', 101.3)} kPa\n"
            f"- Forced Airflow: {scenario_context.get('airflow_cm_s', 5.0)} cm/s\n"
            f"- Fuel Material: {scenario_context.get('material', 'pmma')}\n"
        )

    return f"""{SYSTEM_PROMPT}

SCOPE: {scope.upper()}
{scenario_str}
EVIDENCE CHUNKS FROM NASA PSI & FLIGHT ARCHIVES:
{context_str}

USER QUERY:
<user_query>
{clean_question}
</user_query>

Synthesize a clear, authoritative response strictly citing the evidence chunks above.
"""
