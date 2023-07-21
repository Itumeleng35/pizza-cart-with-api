document.addEventListener("alpine:init", () => {
  Alpine.data("pizzaCart", () => {
    return {
      title: 'Pizza Menu',
      heading: 'Pizzas',
      slogan: 'The perfect home for pizzas',
      pizzas: [],
      username: '',
      cartID: '',
      cartPizzas: [],
      cartTotal: 0.00,
      paymentAmount: 0,
      historicalCart: [],
      message: '',
      login() {
        if (this.username.length > 2) {
          localStorage['username'] = this.username;
          this.createCart();
          setTimeout(function () {
            window.location.reload();
          }, 3000)
        } else {
          alert("Username is too short");
        }
      },
      logout() {
        if (confirm('Do you want to logout?')) {
          this.username = '';
          this.cartID = '';
          localStorage['cartID'] = '';
          localStorage['username'] = '';

        }
      },

      createCart() {
        if (!this.username) {
          //this.cartID = 'No username to create a cart for';
          return Promise.resolve();
        }

        const cartID = localStorage['cartID'];


        if (cartID) {
          this.cartID = cartID;
          return Promise.resolve();
        } else {
          const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`
          return axios.get(createCartURL).then(result => {
            this.cartID = result.data.cart_code;
            localStorage['cartID'] = this.cartID;
          });
        }

      },
      getCart() {
        const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartID}/get`
        return axios.get(getCartURL)
      },

      addPizza(pizzaId) {

        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/add`, {
          "cart_code": this.cartID,
          "pizza_id": pizzaId

        })

      },
      removePizza(pizzaId) {

        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/remove`, {
          "cart_code": this.cartID,
          "pizza_id": pizzaId

        })
      },

      pay(amount) {
        return axios.post(`https://pizza-api.projectcodex.net/api/pizza-cart/pay`,
          {
            "cart_code": this.cartID,
            amount
          })
      },
      showHistoricalCart() {
        // Toggle the visibility of the historical cart using x-show
        this.$refs.historicalCart.style.display = this.$refs.historicalCart.style.display === 'none' ? '' : 'none';
      },
      addToHistoricalCart(cartData) {
        const historicalPizzaData = cartData.cartPizzas.map(pizza => ({
          flavour: pizza.flavour,
          size: pizza.size,
          price: pizza.price,
          qty: pizza.qty,
          total: pizza.total,
        }));

        this.historicalCart.push({
          cartID: cartData.cartID,
          cartPizzas: historicalPizzaData,
          cartTotal: cartData.cartTotal,
          paymentAmount: cartData.paymentAmount,
          timestamp: new Date().toISOString(),
        });
      },


      showCartData() {
        this.getCart().then(result => {

          const cartData = result.data;
          this.cartPizzas = cartData.pizzas;
          this.cartTotal = cartData.total.toFixed(2);
          //alert(this.cartTotal);
        });
      },
      resetCurrentCart() {
        this.cartPizzas = [];
        this.cartTotal = 0.00;
        this.cartID = '';
        this.paymentAmount = 0;
        localStorage['cartID'] = '';
        this.createCart();
      },

      init() {
        const storedUsername = localStorage['username'];
        const storedCartID = localStorage['cartID'];
        console.log(storedUsername);
        if (storedUsername && storedCartID) {
          this.username = storedUsername;
          this.cartID = storedCartID;

          axios
            .get(`https://pizza-api.projectcodex.net/api/pizzas`)
            .then(result => {
              // console.log(result.data);
              this.pizzas = result.data.pizzas
            });

          if (!this.cartId) {
            this
              .createCart()
              .then(() => {
                this.showCartData();
              })
          }

        }




      },
      addPizzaToCart(pizzaId) {
        //alert(pizzaId)
        this
          .addPizza(pizzaId)
          .then(() => {
            this.showCartData();
          })

      },
      removePizzaFromCart(pizzaId) {
        //alert(pizzaId)
        this
          .removePizza(pizzaId)
          .then(() => {
            this.showCartData();
          })

      },



      payForCart() {
        //alert("Pay now: " + this.paymentAmount)
        this
          .pay(this.paymentAmount)
          .then(result => {
            if (result.data.status == 'failure') {
              this.message = result.data.message;
              setTimeout(() => this.message = '', 3000);
            } else {
              this.message = 'Payment received!';

              setTimeout(() => {
                this.message = '';
                this.cartPizzas = [];
                this.cartTotal = 0.00;
                this.cartID = '';
                this.paymentAmount = 0;
                localStorage['cartID'] = '';
                this.createCart();
              }, 3000);
            }
          })
      }
    }
  });
});
