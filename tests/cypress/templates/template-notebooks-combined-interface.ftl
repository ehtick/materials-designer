${tags}
Feature: Combined test to create interface with relaxation and optimization

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Create interface with automatic material import
    When I double click on "${interface_notebook}" entry in sidebar
    And I see file "${interface_notebook}" opened
    And I deselect all materials
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
${interface_material_table}

    # Optimize film position
    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    When I double click on "${optimize_notebook}" entry in sidebar
    And I see file "${optimize_notebook}" opened
    And I select materials in MaterialsSelector
      | name | index |
${interface_material_table}
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
${optimized_material_table}

    # Relax with EMT
    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    When I double click on "${relax_notebook}" entry in sidebar
    And I see file "${relax_notebook}" opened
    And I select materials in MaterialsSelector
      | name | index |
${interface_material_table}
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials

    # Final verification
    Then material with following name exists in state
      | name | index |
${relaxed_material_table}
