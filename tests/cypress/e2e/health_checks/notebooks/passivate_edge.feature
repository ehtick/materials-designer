@notebooks_healthcheck
Feature: Healthcheck to create ${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | Graphene Zigzag Nanoribbon (W=4 L=10) | 2 |
    Then material with following name exists in state
      | name | index |
      | Graphene Zigzag Nanoribbon (W=4 L=10) | 2 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "passivate_edge.ipynb" entry in sidebar
    And I see file "passivate_edge.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | Graphene Zigzag Nanoribbon (W=4 L=10) | 2 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Graphene Zigzag Nanoribbon (W=4 L=10) H-passivated | 3 |
