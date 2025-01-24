Feature: Healthcheck to create Mg1 Ga35 N35, Vacancy  Defect, Pair  Defect, Substitution and Vacancy Defect Pair

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "specific_examples" entry in sidebar
    Then I see "/made/specific_examples/" in path
    When I double click on "defect_point_pair_gallium_nitride.ipynb" entry in sidebar
    And I see file "defect_point_pair_gallium_nitride.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Mg substitution and vacancy in GaN.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Mg1 Ga35 N35, Vacancy  Defect, Pair  Defect, Substitution and Vacancy Defect Pair | 2 |
