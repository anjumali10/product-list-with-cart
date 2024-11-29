console.log('hello world');

function cardSelector(card) {
  // Find the .image, .cart-button, and .cart-button-selected within the clicked card
  let cardImage = card.querySelector('.image');
  let cartButton = card.querySelector('.cart-button');
  let cartButtonSelected = card.querySelector('.cart-button-selected');

  // Toggle the 'selected' class on the card image
  cardImage.classList.toggle('selected');

  // Toggle the visibility of the cart buttons based on whether the card is selected
  if (cardImage.classList.contains('selected')) {
    // If the card is selected, hide the regular cart button and show the 'added to cart' button
    cartButton.style.visibility = 'hidden';
    cartButtonSelected.style.visibility = 'visible';
  } else {
    // If the card is deselected, show the regular cart button and hide the 'added to cart' button
    cartButton.style.visibility = 'visible';
    cartButtonSelected.style.visibility = 'hidden';
  }
}

async function displayCards() {
  let folder = fetch('data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();  // Parse JSON data
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  return folder;
}

function updateCartQuantity() {
  // Get all the cards after they've been rendered
  let cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    let incrementButton = card.querySelector('.increment');
    let decrementButton = card.querySelector('.decrement');
    let quantityElement = card.querySelector('.quantity');

    // Increment event listener
    incrementButton.addEventListener('click', () => {
      let quantity = parseInt(quantityElement.innerHTML);
      quantity += 1; // Increase the quantity by 1
      quantityElement.innerHTML = quantity; // Update the quantity in the DOM
      addToCart(card)
      removeButton()
      updateCarttotal()
      cartStatus()
    });

    // Decrement event listener
    decrementButton.addEventListener('click', () => {
      let quantity = parseInt(quantityElement.innerHTML);
      if (quantity > 0) { // Prevent the quantity from going below 1
        quantity -= 1; // Decrease the quantity by 1
        quantityElement.innerHTML = quantity; // Update the quantity in the DOM
        removeFromCart(decrementButton)
        updateCarttotal()
        cartStatus()
      }
    });
  });
}

function addToCart(card) {
  let quantity = parseInt(card.querySelector('.quantity').innerHTML);  // Ensure quantity is a number
  let name = card.querySelector('.name').innerHTML;
  let price = parseFloat(card.querySelector('.price').innerHTML.replace('@ ', '').replace('$', '')); // Remove '$' and '@' for price extraction
  let nonEmpty = document.querySelector('.non-empty');

  if (quantity > 0) {
    let existingProduct = Array.from(nonEmpty.querySelectorAll('.product')).find(product => {
      return product.querySelector('.name').innerHTML === name;
    });

    if (existingProduct) {
      existingProduct.querySelector('.quantity').innerHTML = `${quantity}x`;
      existingProduct.querySelector('.total-price').innerHTML = `$${(price * quantity).toFixed(2)}`;
    }
    else {
      let productHTML = `
        <div class="product">
          <div class="name">${name}</div>
          <span class="quantity">${quantity}x</span>
          <span class="price">@ $${price}</span>
          <span class="total-price">$${(price * quantity).toFixed(2)}</span>
          <div class="line"></div>
          <div class="remove">
            <div class="circle">
              <img src="assets/images/icon-increment-quantity.svg" alt="">
            </div>
          </div>
        </div>
      `;
      nonEmpty.insertAdjacentHTML('afterbegin', productHTML)
    }
    updateCartHeader()

  }
}

function removeFromCart(button) {
  // Find the card (or product) that corresponds to the clicked button.
  let card = button.closest('.card');  // Assuming the button is inside a `.card` container that also holds the product info

  let name = card.querySelector('.name').innerHTML;  // Get the name of the product from the card
  let price = parseFloat(card.querySelector('.price').innerHTML.replace('@ ', '').replace('$', ''));  // Get the price of the product

  // Find the product in the cart (the cart is likely inside `.non-empty` div)
  let nonEmpty = document.querySelector('.non-empty');
  let productInCart = Array.from(nonEmpty.querySelectorAll('.product')).find(product => {
    return product.querySelector('.name').innerHTML === name;  // Find the matching product by name
  });

  // If the product is found in the cart, update the quantity or remove it
  if (productInCart) {
    let productQuantityElement = productInCart.querySelector('.quantity');
    let productTotalPriceElement = productInCart.querySelector('.total-price');
    let currentQuantity = parseInt(productQuantityElement.innerHTML.replace('x', ''));

    // If the product quantity in the cart is greater than 1, decrement it
    if (currentQuantity > 1) {
      productQuantityElement.innerHTML = `${currentQuantity - 1}x`;
      productTotalPriceElement.innerHTML = `$${((price * (currentQuantity - 1))).toFixed(2)}`;
    } else {
      // If the quantity is 1, remove the product from the cart entirely
      productInCart.remove();
    }

    // Update the cart count
    updateCartHeader();
  }
}

function updateCartHeader() {
  // Recalculate total quantity in the cart
  let nonEmpty = document.querySelector('.non-empty');
  let cartHeader = document.querySelector('.cart-header');

  let currentItemCount = Array.from(nonEmpty.querySelectorAll('.product')).reduce((total, product) => {
    let quantity = product.querySelector('.quantity').innerHTML;
    return total + parseInt(quantity.replace('x', ''));
  }, 0);

  cartHeader.innerHTML = `Your Cart (${currentItemCount})`;
}

// Function to update cart total price
function updateCarttotal() {
  let totals = document.querySelectorAll('.total-price');
  let cartPrice = document.querySelector('.total');
  let cartTotal = 0;
  totals.forEach(total => {
    total = parseFloat(total.innerHTML.replace('$', ''));
    cartTotal += total;
  });
  cartPrice.innerHTML = `$${cartTotal}`;
}

function cartStatus() {
  let cart = document.querySelector('.cart');
  let product = cart.querySelector('.product');
  let nonEmpty = cart.querySelector('.non-empty');
  let empty = cart.querySelector('.empty');

  if (!product) {
    empty.style.display = 'flex';
    nonEmpty.style.display = 'none';
  } else {
    empty.style.display = 'none';
    nonEmpty.style.display = 'block';
  }
}

function removeButton() {
  let removeElements = document.querySelectorAll('.remove');

  removeElements.forEach((removeElement) => {
    let product = removeElement.closest('.product');

    removeElement.addEventListener('click', () => {
      product.remove();  // Remove the product from the cart

      // After removing a product, update cart status and totals
      updateCarttotal();
      cartStatus();
      updateCartHeader();
      
    });
  });
}

function showOrderConfirmation() {
  // Get the cart items
  let cartItems = document.querySelectorAll('.non-empty .product');
  let itemList = document.querySelector('.item-list');
  let orderTotalElement = document.getElementById('order-total');
  let popup = document.getElementById('order-confirmation-popup');

  itemList.innerHTML = ''; // Clear previous items

  // Populate the item list with the cart's contents
  cartItems.forEach(item => {
    let name = item.querySelector('.name').innerHTML;
    let quantity = item.querySelector('.quantity').innerHTML;
    let totalPrice = item.querySelector('.total-price').innerHTML;

    let itemHTML = `
      <div class="item">
        <span class="item-name">${name} (${quantity})</span>
        <span class="item-price">${totalPrice}</span>
      </div>
    `;
    itemList.innerHTML += itemHTML;
  });

  // Update the total price
  let totalPrice = document.querySelector('.cart .total').innerHTML;
  orderTotalElement.innerHTML = totalPrice;

  // Show the popup
  popup.classList.remove('hidden');

  // Add event listener for "Start New Order" button
  document.getElementById('start-new-order').addEventListener('click', () => {
    popup.classList.add('hidden');
    clearCart(); // Function to reset the cart
    // cartStatus();
  });
}

// Attach the showOrderConfirmation function to your confirm order button
document.querySelector('.confirm-order').addEventListener('click', () => {
  showOrderConfirmation();
});

function clearCart() {
  let cartHeader = document.querySelector('.cart-header');
  let nonEmpty = document.querySelector('.non-empty');
  let empty = document.querySelector('.empty');
  let cartProducts = document.querySelectorAll('.product')
  cartProducts.forEach((cartProduct) => {
    cartProduct.remove()
  })
  empty.style.display = 'flex';
  nonEmpty.style.display = 'none';
  cartHeader.innerHTML = `Your Cart (0)`;
  updateProductQuantity()
}
function updateProductQuantity() {
  let cardsQuantity = document.querySelectorAll('.quantity')
  cardsQuantity.forEach((cardQuantity) =>{
    cardQuantity.innerHTML = 0
  })
}

async function main() {
  let cardContainer = document.querySelector('.card-container');
  if (cardContainer) {
    // Fetch cards data
    let cardsData = await displayCards();

    // Render cards dynamically
    cardsData.forEach(cardData => {
      cardContainer.innerHTML += `
        <div class="card">
          <div class="image"><img src="${cardData.image.desktop}" alt=""></div>
          <div class="cart-button">
            <img src="assets/images/icon-add-to-cart.svg" alt="">
            <p>Add to Cart</p>
          </div>
          <div class="cart-button-selected">
            <div class="circle decrement">
              <img src="assets/images/icon-decrement-quantity.svg" alt="" width="8px">
            </div>
            <p class="quantity">0</p>
            <div class="circle increment">
              <img src="assets/images/icon-increment-quantity.svg" alt="" width="8px">
            </div>
          </div>
          <div class="description">
            <p class="category">${cardData.category}</p>
            <p class="name">${cardData.name}</p>
            <p class="price">$${cardData.price}</p>
          </div>
        </div>
      `;
    });

    // After cards are rendered, attach event listeners
    updateCartQuantity();

    // Loop through each card and attach event listeners for selection toggling
    let cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      // Get all the .image and .description elements inside the card
      let cardElements = card.querySelectorAll('.image, .description');

      // Loop through each element inside the card
      cardElements.forEach(element => {
        element.addEventListener('click', function (event) {
          event.stopPropagation(); // Prevent click from bubbling up to parent
          cardSelector(card); // Pass the clicked card to the cardSelector function
        });
      });
    });

  } else {
    console.log('Element not found!');
  }
}

main();
