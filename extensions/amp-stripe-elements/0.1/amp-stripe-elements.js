/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Layout } from "../../../src/layout";

export class AmpStripeElements extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {string} */
    this.cardElementId_ = "stripe-card-element";
    this.buttonText_ = "Submit Payment";

    /** @private {?Element} */
    this.container_ = null;
  }

  /** @override */
  buildCallback() {
    // Form for card collection.
    this.checkoutForm_ = this.element.ownerDocument.createElement("form");

    // Div for the card element.
    this.cardElement_ = this.element.ownerDocument.createElement("div");
    this.cardElement_.id = this.cardElementId_;
    this.checkoutForm_.appendChild(this.cardElement_);

    // Button to start tokenisation.
    const button = this.element.ownerDocument.createElement("button");
    button.textContent = this.buttonText_;
    this.checkoutForm_.appendChild(button);

    this.element.appendChild(this.checkoutForm_);
    this.applyFillContent(this.checkoutForm_, /* replacedContent */ true);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }

  /** @override */
  layoutCallback() {
    // Stripe setup
    const setupStripe = _ => {
      // TODO get pk from param
      this.stripe_ = Stripe("pk_test_iXTtAi8P5cgAHRtHKBGS0ovA");
      const elements = this.stripe_.elements();

      // Custom styling can be passed to options when creating an Element.
      const style = {
        base: {
          // Add your base input styles here. For example:
          fontSize: "16px",
          color: "#32325d"
        }
      };

      // Create an instance of the card Element.
      this.card_ = elements.create("card", { style });

      // Add an instance of the card Element into the `card-element` <div>.
      this.card_.mount(`#${this.cardElementId_}`);

      // TODO input error handling
    };

    // Load Stripe.js
    const stripeSource = document.createElement("script");
    stripeSource.onload = setupStripe;
    stripeSource.src = "https://js.stripe.com/v3/";
    // TODO check if allowed.
    document.head.appendChild(stripeSource);

    // Form submit event handler.
    this.checkoutForm_.addEventListener("submit", event => {
      event.preventDefault();
      console.log("Form submit event:", event);

      this.stripe_.createToken(this.card_).then(function(result) {
        console.log("Card details tokenisation response:", result);
      });
    });

    // Return a load promise for the frame so the runtime knows when the
    // component is ready.
    return this.loadPromise(this.checkoutForm_);
  }
}

AMP.extension("amp-stripe-elements", "0.1", AMP => {
  AMP.registerElement("amp-stripe-elements", AmpStripeElements);
});
