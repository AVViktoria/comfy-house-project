// variables

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");

const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

const cartContent = document.querySelector(".cart-content");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const productsDOM = document.querySelector(".products-center");
//main cart
let cart = [];
//buttons
let buttonsDOM = [];

//getting the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    // console.log(products);
    let result = "";
    products.forEach((product) => {
      result += `
        <article class="product">
          <div class="img-container">
            <img
              class="product-img"
              src=${product.image}
              alt="product"
            />

            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>$${product.price}</h4> 
        </article>
      `;
    });

    productsDOM.innerHTML = result;
  }
  //check item by id and added to cart
  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;

      //made btn disabled when add to cart
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "in Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "in Cart";
        event.target.disabled = true;

        //  get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        //  add product to the cart
        cart = [...cart, cartItem];
        //  save cart to local storage
        Storage.saveCart(cart);
        //  set cart values
        this.setCartValues(cart);
        //  display cart item
        this.addCartItem(cartItem);
        //  show the cart вешаем классы что бы показать cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    // console.log(tempTotal, itemsTotal);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src=${item.image} alt="product" />
                <div>
                  <h4>${item.title}</h4>
                  <h5>$${item.price}</h5>
                  <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div>
                  <i class="fas fa-chevron-up" data-id=${item.id}></i>
                  <p class="item-amount">${item.amount}</p>
                  <i class="fas fa-chevron-down" data-id=${item.id}></i>
                </div>
    `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  setupAPP() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    // clear cart button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (ev) => {
      //  remove element from cart
      if (ev.target.classList.contains("remove-item")) {
        let removeItem = ev.target;
        // console.log(removeItem);
        let id = removeItem.dataset.id;
        // console.log(id);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (ev.target.classList.contains("fa-chevron-up")) {
        let addAmount = ev.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      //add element to cart
      else if (ev.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = ev.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);

        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    // console.log(this); //show UI {}
    let cartItems = cart.map((item) => item.id); // all id_s in cart
    cartItems.forEach((id) => this.removeItem(id));
    // console.log(cartContent.children);
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disable = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

//local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  //if something in local storage is will be in cart ot []
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //setup app
  ui.setupAPP();

  //get all products
  products
    .getProducts()
    .then((products) => {
      // console.log(products)
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
