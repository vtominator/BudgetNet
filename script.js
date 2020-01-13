const budgetController = (function() {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });
    data.totals[type] = sum;
  };

  return {
    addItem: function(type, description, value) {
      let item, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "exp") {
        item = new Expense(ID, description, value);
      } else {
        item = new Income(ID, description, value);
      }

      data.allItems[type].push(item);
      return item;
    },

    deleteItem: function(type, ID) {
      const ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      const index = ids.indexOf(ID);
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

const UIController = (function() {
  const DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expenseLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container"
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: function(object, type) {
      let html, newHtml, element;

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace("%id%", object.id);
      newHtml = newHtml.replace("%description%", object.description);
      newHtml = newHtml.replace("%value%", object.value);

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      const element = document.getElementById(selectorID);
      element.parentNode.removeChild(element);
    },

    clearFields: function() {
      const fields = document.querySelectorAll(DOMStrings.inputDescription + ", " + DOMStrings.inputValue);
      const fieldsArray = Array.prototype.slice.call(fields);

      fieldsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      fieldsArray[0].focus();
    },

    displayBudget: function(object) {
      document.querySelector(DOMStrings.budgetLabel).textContent = object.budget;
      document.querySelector(DOMStrings.incomeLabel).textContent = object.totalInc;
      document.querySelector(DOMStrings.expenseLabel).textContent = object.totalExp;

      if (object.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = object.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

const controller = (function(budgetCtrl, UICtrl) {
  const setupEventListeners = function() {
    const DOMStrings = UICtrl.getDOMStrings();

    document.querySelector(DOMStrings.inputButton).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOMStrings.container).addEventListener("click", ctrlDeleteItem);
  };

  const updateBudget = function() {
    // 1. Calculate the budget
    budgetController.calculateBudget();

    // 2. Return the budget
    const budget = budgetController.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const ctrlAddItem = function() {
    // 1. Get the field input data
    const input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      const item = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI and clear fields
      UICtrl.addListItem(item, input.type);
      UICtrl.clearFields();

      // 4. Calculate and update budget
      updateBudget();
    }
  };

  const ctrlDeleteItem = function(event) {
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split("-");
      const type = splitID[0];
      const ID = parseInt(splitID[1]);

      // 1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
