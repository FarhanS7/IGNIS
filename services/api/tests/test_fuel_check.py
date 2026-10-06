"""Unit tests for Fuel and Material Family Compatibility Check (Task B1.1)."""

from services.api.app.eligibility.fuel_check import check_fuel_compatibility
from services.api.app.models.enums import EligibilityStatus, MaterialFamily


class TestFuelCompatibility:
    def test_exact_match_eligible(self):
        result = check_fuel_compatibility(MaterialFamily.PMMA, MaterialFamily.PMMA)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Exact material family match" in result.reason

    def test_compatible_family_eligible(self):
        # Cellulose is compatible with Fabric Cotton
        result = check_fuel_compatibility(MaterialFamily.CELLULOSE, MaterialFamily.FABRIC_COTTON)
        assert result.status == EligibilityStatus.ELIGIBLE
        assert "Compatible material family" in result.reason

    def test_incompatible_family_ineligible(self):
        # Fabric Cotton is incompatible with Droplet Fuel
        result = check_fuel_compatibility(MaterialFamily.FABRIC_COTTON, MaterialFamily.DROPLET_FUEL)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "Incompatible material family" in result.exclusion_reason

    def test_gas_fuel_incompatible_with_pmma(self):
        result = check_fuel_compatibility(MaterialFamily.PMMA, MaterialFamily.GAS_FUEL)
        assert result.status == EligibilityStatus.INELIGIBLE
        assert "Incompatible material family" in result.exclusion_reason

    def test_none_run_material_warning(self):
        result = check_fuel_compatibility(MaterialFamily.PMMA, None)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert result.warning is not None

    def test_unknown_run_material_warning(self):
        result = check_fuel_compatibility(MaterialFamily.PMMA, MaterialFamily.UNKNOWN)
        assert result.status == EligibilityStatus.ELIGIBLE_WITH_WARNING
        assert result.warning is not None
