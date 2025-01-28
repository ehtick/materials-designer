@notebooks
Feature: Healthcheck to create ${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
${materials_table}
    Then material with following name exists in state
      | name | index |
${materials_table}

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "${notebook_name}" entry in sidebar
    And I see file "${notebook_name}" opened

    # Select materials
    When I select materials from dropdown
      | name | index |
${materials_table}
    Then I see materials selected
      | name | index |
${materials_table}

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "${material_file_name}" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name | index |
${materials_table}
