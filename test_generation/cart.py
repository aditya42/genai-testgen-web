"""SauceDemo add-to-cart acceptance cases and safe Playwright action compiler.

All tests authenticate first. Negative scenarios validate rejected/absent states,
not deliberate product failures.
"""

import json
from pathlib import Path


REQUIREMENTS = [
    {"id": "CART-001", "intent": "single_item",
     "goal": "Adding the backpack updates the cart count and cart contents.",
     "steps": ["login", "add_backpack", "badge_one", "open_cart", "backpack_visible"]},
    {"id": "CART-002", "intent": "multiple_items",
     "goal": "Adding two different products gives two distinct cart items.",
     "steps": ["login", "add_backpack", "add_bike_light", "badge_two",
               "open_cart", "backpack_visible", "bike_light_visible"]},
    {"id": "CART-003", "intent": "remove_item",
     "goal": "Removing a product leaves the cart empty.",
     "steps": ["login", "add_backpack", "remove_backpack", "badge_absent",
               "open_cart", "backpack_absent"]},
    {"id": "CART-004", "intent": "empty_cart",
     "goal": "An untouched cart contains no product and no quantity badge.",
     "steps": ["login", "badge_absent", "open_cart", "cart_empty"]},
    {"id": "CART-005", "intent": "prevent_duplicate",
     "goal": "A product cannot be added twice through its changed Remove action.",
     "steps": ["login", "add_backpack", "badge_one", "add_button_absent",
               "open_cart", "one_cart_item"]},
]

ACTIONS = {
    "login": [
        "await loginPage.loginAs('standard_user', 'secret_sauce');",
        r"await expect(page).toHaveURL(/\/inventory\.html$/);",
    ],
    "add_backpack": [
        "await inventoryPage.addToCart('sauce-labs-backpack');",
    ],
    "add_bike_light": [
        "await inventoryPage.addToCart('sauce-labs-bike-light');",
    ],
    "badge_one": [
        "await expect(inventoryPage.cartBadge).toHaveText('1');",
    ],
    "badge_two": [
        "await expect(inventoryPage.cartBadge).toHaveText('2');",
    ],
    "badge_absent": [
        "await expect(inventoryPage.cartBadge).toHaveCount(0);",
    ],
    "open_cart": [
        "await inventoryPage.openCart();",
        r"await expect(page).toHaveURL(/\/cart\.html$/);",
    ],
    "backpack_visible": [
        "await expect(cartPage.itemNamed('Sauce Labs Backpack')).toBeVisible();",
    ],
    "bike_light_visible": [
        "await expect(cartPage.itemNamed('Sauce Labs Bike Light')).toBeVisible();",
    ],
    "remove_backpack": [
        "await inventoryPage.removeFromCart('sauce-labs-backpack');",
    ],
    "backpack_absent": [
        "await expect(cartPage.itemNamed('Sauce Labs Backpack')).toHaveCount(0);",
    ],
    "cart_empty": [
        "await expect(cartPage.items).toHaveCount(0);",
    ],
    "one_cart_item": [
        "await expect(cartPage.items).toHaveCount(1);",
    ],
    "add_button_absent": [
        "await expect(inventoryPage.addButton('sauce-labs-backpack')).toHaveCount(0);",
    ],
}

def mock_cases():
    return [
        {"id": requirement["id"], "title": requirement["goal"],
         "intent": requirement["intent"], "steps": requirement["steps"][:]}
        for requirement in REQUIREMENTS
    ]


def validate_cases(cases):
    """Require exact reviewed acceptance steps; reject arbitrary model code."""
    expected = {item["id"]: item for item in REQUIREMENTS}
    if (not isinstance(cases, list) or len(cases) != len(expected)
            or any(not isinstance(case, dict) for case in cases)
            or {case.get("id") for case in cases} != set(expected)):
        raise RuntimeError("Generated cart cases are missing or duplicated")
    for case in cases:
        source = expected[case["id"]]
        if (case.get("intent") != source["intent"]
                or case.get("steps") != source["steps"]
                or not isinstance(case.get("title"), str)
                or not 8 <= len(case["title"]) <= 160):
            raise RuntimeError("Generated cart case failed safety validation")
    return cases


def compile_playwright(cases, mapping, root):
    validate_cases(cases)
    lines = [
        "import { test, expect } from '@playwright/test';",
        "import { LoginPage } from '../pages/LoginPage';",
        "import { InventoryPage } from '../pages/InventoryPage';",
        "import { CartPage } from '../pages/CartPage';",
    ]
    for case in cases:
        marker = f"[TR:C{mapping[case['id']]}] " if case["id"] in mapping else ""
        lines.append(
            f"test({json.dumps(marker + '[' + case['id'] + '] ' + case['title'])}, "
            "async ({ page }) => {"
        )
        lines.extend([
            "  const loginPage = new LoginPage(page);",
            "  const inventoryPage = new InventoryPage(page);",
            "  const cartPage = new CartPage(page);",
        ])
        for action in case["steps"]:
            lines.extend("  " + statement for statement in ACTIONS[action])
        lines.append("});")
    target = Path(root) / "generated_tests" / "cart.spec.ts"
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text("\n".join(lines) + "\n", encoding="utf-8")
