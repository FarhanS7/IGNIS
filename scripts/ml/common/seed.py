"""Global deterministic random seed for ML pipelines."""

import random
import numpy as np

DEFAULT_SEED = 42


def set_seed(seed: int = DEFAULT_SEED):
    """Seed python random and numpy."""
    random.seed(seed)
    np.random.seed(seed)

