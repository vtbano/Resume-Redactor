// Amazon shopping
const user = {
  name: 'Kim',
  active: true,
  cart: [],
  purchases: [],
}

const items = [
  { id: 1, name: 'Laptop', price: 999, tax: 0, total: 999 },
  { id: 2, name: 'Phone', price: 799, tax: 0, total: 799 },
  { id: 3, name: 'Tablet', price: 499, tax: 0, total: 499 },
  { id: 4, name: 'Headphones', price: 199, tax: 0, total: 199 },
  { id: 5, name: 'Charger', price: 49, tax: 0, total: 49 },
]

function addItemToCart(itemId, user) {
  const item = items.find((i) => i.id === itemId)
  if (item) {
    const itemWithTax = addTaxToItem(item)
    const newCart = [...user.cart, itemWithTax]
    const newUser = { ...user, cart: newCart }
    console.log(`${item.name} has been added to your cart with tax.`)
    return newUser
  } else {
    console.log('Item not found.')
  }
}

function addTaxToItem(item) {
  const updatedItem = { ...item }
  updatedItem.tax = parseFloat((item.price * 0.03).toFixed(2))
  updatedItem.total = parseFloat((item.price + updatedItem.tax).toFixed(2))
  return updatedItem
}

function buyItem(itemId, user) {
  const item = user.cart.find((i) => i.id === itemId)
  user.purchases.push(item)
  const updatedCart = user.cart.filter((item) => item.id !== itemId)
  return updatedCart
}

function emptyCart(user) {
  return (user.cart = [])
}

//Implement a cart feature:
// 1. Add items to cart.
// 2. Add 3% tax to item in cart
// 3. Buy item: cart --> purchases
// 4. Empty cart

//Bonus:
// accept refunds.
// Track user history.

console.log('Initial user state:', user)
console.log('Available items:', items)

addItemToCart(1, user)
addItemToCart(3, user)
console.log('User state after adding items to cart:', addItemToCart(3, user))

user.cart = buyItem(1, user)
console.log('User state after buying an item:', user)

user.cart = emptyCart(user)
console.log('User state after emptying the cart:', user)
