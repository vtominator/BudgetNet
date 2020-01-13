const budgetController = (function() {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
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

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calculatePercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      const allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      });
      return allPercentages;
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
    container: ".container",
    expensesPercentLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  const formatNumber = function(num, type) {
    // +/- before the number
    // exactly 2 decimal points
    // comma separating the thousands
    // 1234.5678 -> + 1,234.57

    num = Math.abs(num);
    num = num.toFixed(2);

    const numSplit = num.split(".");
    let integer = numSplit[0];
    let decimal = numSplit[1];

    if (integer.length > 3) {
      integer = integer.substr(0, integer.length - 3) + "," + integer.substr(integer.length - 3);
    }

    return (type === "exp" ? "-" : "+") + " " + integer + "." + decimal;
  };

  const nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
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
      newHtml = newHtml.replace("%value%", formatNumber(object.value, type));

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
      object.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(object.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(object.totalInc, "inc");
      document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(object.totalExp, "exp");

      if (object.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = object.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      const fields = document.querySelectorAll(DOMStrings.expensesPercentLabel);

      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + " " + year;
    },

    changedType: function() {
      const fields = document.querySelectorAll(
        DOMStrings.inputType + "," + DOMStrings.inputDescription + "," + DOMStrings.inputValue
      );

      nodeListForEach(fields, function(current) {
        current.classList.toggle("red-focus");
      });

      document.querySelector(DOMStrings.inputButton).classList.toggle('red');
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

    document.querySelector(DOMStrings.inputType).addEventListener("change", UICtrl.changedType);
  };

  const updateBudget = function() {
    // 1. Calculate the budget
    budgetController.calculateBudget();

    // 2. Return the budget
    const budget = budgetController.getBudget();

    // 3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function() {
    // 1. Calculate percentages
    budgetCtrl.calculatePercentages();

    // 2. Read percentages from the budget controller
    const percentages = budgetCtrl.getPercentages();

    // 3. Update the UI with the new percentages
    UICtrl.displayPercentages(percentages);
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

      // 5. Update percentages
      updatePercentages();
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

      // 4. Update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      console.log("Application has started.");
      UICtrl.displayMonth();
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
