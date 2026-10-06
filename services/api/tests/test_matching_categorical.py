"""Unit tests for Categorical Similarity Function (Task B2.2)."""

from services.api.app.matching.categorical import categorical_similarity
from services.api.app.models.enums import MaterialFamily


class TestCategoricalSimilarity:
    def test_exact_match(self):
        score = categorical_similarity(MaterialFamily.PMMA, MaterialFamily.PMMA)
        assert score == 1.00

    def test_same_parent_class(self):
        score = categorical_similarity(MaterialFamily.PMMA, MaterialFamily.THICK_SOLID)
        assert score == 0.70

        score_reverse = categorical_similarity(MaterialFamily.THICK_SOLID, MaterialFamily.PMMA)
        assert score_reverse == 0.70

    def test_reviewed_related_class(self):
        # Fabric Cotton is compatible with Thin Solid as a reviewed related class
        score = categorical_similarity(MaterialFamily.FABRIC_COTTON, MaterialFamily.THIN_SOLID)
        assert score == 0.40

    def test_known_mismatch(self):
        # Fabric Cotton vs Droplet Fuel has no compatibility
        score = categorical_similarity(MaterialFamily.FABRIC_COTTON, MaterialFamily.DROPLET_FUEL)
        assert score == 0.00

    def test_none_material_returns_none(self):
        assert categorical_similarity(None, MaterialFamily.PMMA) is None
        assert categorical_similarity(MaterialFamily.PMMA, None) is None
        assert categorical_similarity(None, None) is None

    def test_unknown_material_returns_none(self):
        assert categorical_similarity(MaterialFamily.UNKNOWN, MaterialFamily.PMMA) is None
        assert categorical_similarity(MaterialFamily.PMMA, MaterialFamily.UNKNOWN) is None
