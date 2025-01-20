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
    When I double click on "${tutorial_notebook_name}" entry in sidebar
    And I see file "${tutorial_notebook_name}" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "${tutorial_material_path}" on filesystem
    And I submit materials
    Then material with following data exists in state
      | path                      | index                         |
      | ${tutorial_material_path} | ${ tutorial_material_index } |
