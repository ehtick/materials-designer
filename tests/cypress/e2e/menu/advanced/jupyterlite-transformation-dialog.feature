Feature: User can open JupyterLite Transformation dialog and create an interface with a jupyter notebook

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I click on "1.1. Interface creation with Zur and McGill Superlattice (ZSL) algorithm" link
    Then I see file "create_interface_with_min_strain_zsl.ipynb" opened


    # Change code
    When I set code in the cell "3" to:
    """
SUBSTRATE_PARAMETERS = {
    "MILLER_INDICES": (1, 1, 1),
    "THICKNESS": 1,
}

LAYER_PARAMETERS = {
    "MILLER_INDICES": (1, 1, 1),
    "THICKNESS": 1,
}

USE_CONVENTIONAL_CELL = True
    """

    And I set code in the cell "13" to:
    """
from mat3ra.made.tools.build import create_interfaces

interface_data_holder = create_interfaces(
    substrate=materials[0],
    layer=materials[0],
    settings={
        "SUBSTRATE_PARAMETERS": SUBSTRATE_PARAMETERS,
        "LAYER_PARAMETERS": LAYER_PARAMETERS,
        "USE_CONVENTIONAL_CELL": USE_CONVENTIONAL_CELL,
        "ZSL_PARAMETERS": ZSL_PARAMETERS,
        "INTERFACE_PARAMETERS": INTERFACE_PARAMETERS,
    },
    sort_by_strain_and_size=True,
    remove_duplicates=True,
)
    """

    When I set code in the cell "5" to:
    """
    INTERFACE_PARAMETERS = {
    "DISTANCE_Z": 3.0,  # in Angstroms
    "MAX_AREA": 50,  # in Angstroms^2
}
    """
    Then I see code in the cell "5" is:
    """
    INTERFACE_PARAMETERS = {
    "DISTANCE_Z": 3.0,  # in Angstroms
    "MAX_AREA": 50,  # in Angstroms^2
}
    """

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following data exists in state
      | path              | index   |
      | si-interface.json | $INT{2} |


    # Reset the materials list
    And I delete materials with index "2"
