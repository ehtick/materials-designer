Feature: User can open JupyterLite Transformation dialog and create an interface with a jupyter notebook

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
    When I double click on "defect_point_adatom_island_mos2_pt.ipynb.ipynb" entry in sidebar
    And I see file "defect_point_adatom_island_mos2_pt.ipynb.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "made/specific_examples/defect_point_adatom_island_mos2_pt.ipynb" on filesystem
    And I submit materials
    Then material with following data exists in state
      | path                      | index                      |
      | made/specific_examples/defect_point_adatom_island_mos2_pt.ipynb | 0 |
