Feature: User can open JupyterLite Transformation dialog and create an interface with a jupyter notebook

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see "Introduction.ipynb" file opened

    # Open notebook
    When I click on "1.1. Interface creation with Zur and McGill Superlattice (ZSL) algorithm" link
    Then I see "create_interface_with_min_strain_zsl.ipynb" file opened


    # Change code
   When I change value in the cell "In [3]" to:
    """
    INTERFACE_PARAMETERS = {
    "DISTANCE_Z": 3.0,  # in Angstroms
    "MAX_AREA": 50,  # in Angstroms^2
}
    """
   Then I see the value changed in the cell "In [3]"

    # Run

    When I Run all cells
    Then I see