import { productList } from "./constants/list";
import { NUMBERS, SALE_NUMBERS } from "./constants/magicNumbers";
import { MESSAGES, SYMBOL } from "./constants/messages";

var select, addButton, cartDisplay, sum, stockInfo;
var lastSelect,
  bonusPoints = 0,
  totalAmount = 0,
  itemCount = 0;

function main() {
  const root = document.getElementById("app");
  let cont = document.createElement("div");
  const wrap = document.createElement("div");
  let hTxt = document.createElement("h1");
  cartDisplay = document.createElement("div");
  sum = document.createElement("div");
  select = document.createElement("select");
  addButton = document.createElement("button");
  stockInfo = document.createElement("div");
  cartDisplay.id = "cart-items";
  sum.id = "cart-total";
  select.id = "product-select";
  addButton.id = "add-to-cart";
  stockInfo.id = "stock-status";
  cont.className = "bg-gray-100 p-8";
  wrap.className =
    "max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8";
  hTxt.className = "text-2xl font-bold mb-4";
  sum.className = "text-xl font-bold my-4";
  select.className = "border rounded p-2 mr-2";
  addButton.className = "bg-blue-500 text-white px-4 py-2 rounded";
  stockInfo.className = "text-sm text-gray-500 mt-2";
  hTxt.textContent = MESSAGES.SHOPPING_BASKET;
  addButton.textContent = MESSAGES.ADD;
  updateSelOpts();
  wrap.appendChild(hTxt);
  wrap.appendChild(cartDisplay);
  wrap.appendChild(sum);
  wrap.appendChild(select);
  wrap.appendChild(addButton);
  wrap.appendChild(stockInfo);
  cont.appendChild(wrap);
  root.appendChild(cont);
  calcCart();
  setTimeout(function () {
    setInterval(function () {
      const luckyItem =
        productList[Math.floor(Math.random() * productList.length)];
      if (Math.random() < 0.3 && luckyItem.q > 0) {
        luckyItem.val = Math.round(luckyItem.val * 0.8);
        alert(MESSAGES.LIGHTNING_SALE(luckyItem.name));
        updateSelOpts();
      }
    }, SALE_NUMBERS.LIGHTNING_INTERVAL);
  }, Math.random() * SALE_NUMBERS.LIGHTNING_DELAY);
  setTimeout(function () {
    setInterval(function () {
      if (lastSelect) {
        const suggest = productList.find(function (item) {
          return item.id !== lastSelect && item.q > 0;
        });
        if (suggest) {
          alert(MESSAGES.SUGGESTION_SALE(suggest.name));
          suggest.val = Math.round(suggest.val * 0.95);
          updateSelOpts();
        }
      }
    }, SALE_NUMBERS.SUGGESTION_SALE);
  }, Math.random() * SALE_NUMBERS.SUGGESTION_DELAY);
}

function updateSelOpts() {
  select.innerHTML = "";
  productList.forEach(function (item) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent =
      item.name + ` ${SYMBOL.HYPHEN_MINUS} ` + item.val + MESSAGES.WON;
    if (item.q === 0) option.disabled = true;
    select.appendChild(option);
  });
}
function calcCart() {
  totalAmount = 0;
  itemCount = 0;
  const cartItems = cartDisplay.children;
  let subTot = 0;
  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      let curItem;
      for (let j = 0; j < productList.length; j++) {
        if (productList[j].id === cartItems[i].id) {
          curItem = productList[j];
          break;
        }
      }
      const q = parseInt(
        cartItems[i].querySelector("span").textContent.split("x ")[1]
      );
      const itemTotal = curItem.val * q;
      let disc = 0;
      itemCount += q;
      subTot += itemTotal;
      if (q >= 10) {
        if (curItem.id === "p1") disc = 0.1;
        else if (curItem.id === "p2") disc = 0.15;
        else if (curItem.id === "p3") disc = 0.2;
        else if (curItem.id === "p4") disc = 0.05;
        else if (curItem.id === "p5") disc = 0.25;
      }
      totalAmount += itemTotal * (1 - disc);
    })();
  }
  let discRate = 0;
  if (itemCount >= 30) {
    var bulkDisc = totalAmount * 0.25;
    var itemDisc = subTot - totalAmount;
    if (bulkDisc > itemDisc) {
      totalAmount = subTot * (1 - 0.25);
      discRate = 0.25;
    } else {
      discRate = (subTot - totalAmount) / subTot;
    }
  } else {
    discRate = (subTot - totalAmount) / subTot;
  }
  if (new Date().getDay() === 2) {
    totalAmount *= 1 - 0.1;
    discRate = Math.max(discRate, 0.1);
  }
  sum.textContent =
    `${MESSAGES.AMOUNT + SYMBOL.COLON} ` +
    Math.round(totalAmount) +
    MESSAGES.WON;
  if (discRate > NUMBERS.ZERO) {
    var span = document.createElement("span");
    span.className = "text-green-500 ml-2";
    span.textContent = MESSAGES.APPLY_DISCOUNT(
      (discRate * NUMBERS.HUNDRED).toFixed(1)
    );
    sum.appendChild(span);
  }
  updateStockInfo();
  renderBonusPoints();
}
const renderBonusPoints = () => {
  bonusPoints = Math.floor(totalAmount / NUMBERS.THOUSAND);
  let pointsTag = document.getElementById("loyalty-points");
  if (!pointsTag) {
    pointsTag = document.createElement("span");
    pointsTag.id = "loyalty-points";
    pointsTag.className = "text-blue-500 ml-2";
    sum.appendChild(pointsTag);
  }
  pointsTag.textContent = MESSAGES.BONUS_POINT(bonusPoints);
};
function updateStockInfo() {
  let infoMessage = "";
  productList.forEach(function (item) {
    if (item.q < 5) {
      infoMessage +=
        item.name +
        ": " +
        (item.q > 0 ? MESSAGES.STOCK_INFO(item.q) : MESSAGES.SOLD_OUT) +
        "\n";
    }
  });
  stockInfo.textContent = infoMessage;
}
main();
addButton.addEventListener("click", function () {
  const selectItem = select.value;
  const itemToAdd = productList.find(function (p) {
    return p.id === selectItem;
  });
  if (itemToAdd && itemToAdd.q > 0) {
    const item = document.getElementById(itemToAdd.id);
    if (item) {
      const newQuantity =
        parseInt(item.querySelector("span").textContent.split("x ")[1]) + 1;
      if (newQuantity <= itemToAdd.q) {
        item.querySelector("span").textContent =
          itemToAdd.name +
          ` ${SYMBOL.HYPHEN_MINUS} ` +
          itemToAdd.val +
          "원 x " +
          newQuantity;
        itemToAdd.q--;
      } else {
        alert(MESSAGES.OUT_STOCK);
      }
    } else {
      const newItem = document.createElement("div");
      newItem.id = itemToAdd.id;
      newItem.className = "flex justify-between items-center mb-2";
      newItem.innerHTML =
        "<span>" +
        itemToAdd.name +
        ` ${SYMBOL.HYPHEN_MINUS} ` +
        itemToAdd.val +
        "원 x 1</span><div>" +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="-1">-</button>' +
        '<button class="quantity-change bg-blue-500 text-white px-2 py-1 rounded mr-1" data-product-id="' +
        itemToAdd.id +
        '" data-change="1">+</button>' +
        '<button class="remove-item bg-red-500 text-white px-2 py-1 rounded" data-product-id="' +
        itemToAdd.id +
        '">삭제</button></div>';
      cartDisplay.appendChild(newItem);
      itemToAdd.q--;
    }
    calcCart();
    lastSelect = selectItem;
  }
});
cartDisplay.addEventListener("click", function (event) {
  const target = event.target;
  if (
    target.classList.contains("quantity-change") ||
    target.classList.contains("remove-item")
  ) {
    const productId = target.dataset.productId;
    const itemElement = document.getElementById(productId);
    const product = productList.find(function (p) {
      return p.id === productId;
    });
    if (target.classList.contains("quantity-change")) {
      const quantityChange = parseInt(target.dataset.change);
      const newQuantity =
        parseInt(itemElement.querySelector("span").textContent.split("x ")[1]) +
        quantityChange;
      if (
        newQuantity > 0 &&
        newQuantity <=
          product.q +
            parseInt(
              itemElement.querySelector("span").textContent.split("x ")[1]
            )
      ) {
        itemElement.querySelector("span").textContent =
          itemElement.querySelector("span").textContent.split("x ")[0] +
          "x " +
          newQuantity;
        product.q -= quantityChange;
      } else if (newQuantity <= 0) {
        itemElement.remove();
        product.q -= quantityChange;
      } else {
        alert(MESSAGES.OUT_STOCK);
      }
    } else if (target.classList.contains("remove-item")) {
      const removeQuantity = parseInt(
        itemElement.querySelector("span").textContent.split("x ")[1]
      );
      product.q += removeQuantity;
      itemElement.remove();
    }
    calcCart();
  }
});
