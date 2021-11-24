import React, { useContext, useState } from "react";
import CartContext from "../../store/cart-context";
import Modal from "../UI/Modal";
import CartItem from "./CartItem";
import styles from "./Cart.module.css";
import Checkout from "./Checkout";
import { API } from "../../tools/constants";

const Cart = (props) => {
  const [isCheckout, setIsCheckout] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [didSubmited, setDidSubmitted] = useState(false);
  const [httpError, setHttpError] = useState();
  const cartContext = useContext(CartContext);

  const totalAmount = `$${cartContext.totalAmount.toFixed(2)}`;
  const hasItems = cartContext.items.length > 0;

  const cartItemRemoveHandler = (id) => {
    cartContext.removeItem(id);
  };

  const cartItemAddHandler = (item) => {
    cartContext.addItem({ ...item, amount: 1 });
  };

  const cartItems = (
    <ul className={styles["cart-items"]}>
      {cartContext.items.map((item) => (
        <CartItem
          key={item.id}
          name={item.name}
          amount={item.amount}
          price={item.price}
          onRemove={cartItemRemoveHandler.bind(null, item.id)}
          onAdd={cartItemAddHandler.bind(null, item)}
        />
      ))}
    </ul>
  );

  const orderButtonHandler = (event) => {
    setIsCheckout(true);
  };

  const submitOrderHandler = async (userData) => {
    setIsSubmitted(true);

    const request = await fetch(`${API}/orders.json`, {
      method: "POST",
      body: JSON.stringify({
        user: userData,
        orderedItems: cartContext.items,
      }),
    });

    if (!request.ok) {
      setIsSubmitted(false);
      setHttpError(`ERROR: ${request.status} ${request.statusText}`);
      return;
    }

    setIsSubmitted(false);
    setDidSubmitted(true);
  };


  const modalActions = (
    <div className={styles.actions}>
      <button className={styles["button--alt"]} onClick={props.onClose}>
        Close
      </button>
      {hasItems && (
        <button className={styles.button} onClick={orderButtonHandler}>
          Order
        </button>
      )}
    </div>
  );

  let cardContent = (
    <React.Fragment>
      {cartItems}
      <div className={styles.total}>
        <span>Total Amount</span>
        <span>{totalAmount}</span>
      </div>
      {isCheckout && (
        <Checkout onConfirm={submitOrderHandler} onCancel={props.onClose} />
      )}
      {!isCheckout && modalActions}
    </React.Fragment>
  );

  if (httpError) {
    cardContent = (
      <React.Fragment>
        <p className={styles.invalid}>{httpError}</p>
      </React.Fragment>
    );
  }

  if (isSubmitted) {
    cardContent = <p className={styles.invalid}>Sending order data ...</p>;
  }

  if (didSubmited) {
    cardContent = (
      <p className={styles.invalid}>Successfully sent the order!</p>
    );
  }

  return <Modal onClose={props.onClose}>{cardContent}</Modal>;
};

export default Cart;
