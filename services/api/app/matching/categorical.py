"""Categorical Similarity Function (Task B2.2 | PRD v1.1 §15.2).

Computes tiered similarity score for categorical material families:
- exact match: 1.00
- same parent class: 0.70
- reviewed related class: 0.40
- known mismatch: 0.00
- missing: None
"""

from ..models.enums import MaterialFamily, MATERIAL_FAMILY_COMPATIBILITY

# Direct parent/child taxonomy relations
SAME_PARENT_CLASS: dict[MaterialFamily, set[MaterialFamily]] = {
    MaterialFamily.PMMA: {MaterialFamily.THICK_SOLID},
    MaterialFamily.POLYETHYLENE: {MaterialFamily.THICK_SOLID},
    MaterialFamily.THICK_SOLID: {MaterialFamily.PMMA, MaterialFamily.POLYETHYLENE},
    MaterialFamily.FABRIC_COTTON: {MaterialFamily.CELLULOSE},
    MaterialFamily.CELLULOSE: {MaterialFamily.FABRIC_COTTON},
    MaterialFamily.FABRIC_SYNTHETIC: {MaterialFamily.THIN_SOLID},
    MaterialFamily.THIN_SOLID: {MaterialFamily.FABRIC_SYNTHETIC},
}


def categorical_similarity(
    scenario_material: MaterialFamily | None,
    run_material: MaterialFamily | None,
) -> float | None:
    """Computes tiered similarity score for material families.

    Returns:
        float in [0.0, 1.0] if both materials are provided.
        None if either material is None or UNKNOWN.
    """
    if scenario_material is None or run_material is None:
        return None

    if scenario_material == MaterialFamily.UNKNOWN or run_material == MaterialFamily.UNKNOWN:
        return None

    # 1. Exact match
    if scenario_material == run_material:
        return 1.00

    # 2. Same parent class
    if run_material in SAME_PARENT_CLASS.get(scenario_material, set()):
        return 0.70

    # 3. Reviewed related class (in compatibility map but not direct parent)
    if run_material in MATERIAL_FAMILY_COMPATIBILITY.get(scenario_material, set()):
        return 0.40

    # 4. Known mismatch
    return 0.00
