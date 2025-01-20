@ignore
Feature: User can create a GIF

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened
    And I select material with index "1" in MaterialsSelector

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following data exists in state
      | path              | index   |
      | zsl-gr-ni-interface.json | $INT{3} |


    # Reset the materials list
    And I delete materials with index "3"
    And I delete materials with index "2"
