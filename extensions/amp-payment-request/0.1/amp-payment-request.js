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

export class AmpPaymentRequest extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.button_ = null;
  }

  /** @override */
  buildCallback() {
    this.button_ = this.element.ownerDocument.createElement("button");
    this.button_.id = "buyButton";
    this.button_.textContent = "Checkout";
    this.element.appendChild(this.button_);
    this.applyFillContent(this.button_, /* replacedContent */ true);

    // config
    const allowedCardNetworks = [
      "AMEX",
      "DISCOVER",
      "JCB",
      "MASTERCARD",
      "VISA"
    ];
    const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

    /**
     * Define your unique Google Pay API configuration
     *
     * @returns {object} data attribute suitable for PaymentMethodData
     */
    function getGooglePaymentsConfiguration() {
      return {
        environment: "TEST",
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
          // A merchant ID is available after approval by Google.
          // 'merchantId':'01234567890123456789',
          merchantName: "Example Merchant"
        },
        allowedPaymentMethods: [
          {
            type: "CARD",
            parameters: {
              allowedAuthMethods: allowedCardAuthMethods,
              allowedCardNetworks: allowedCardNetworks
            },
            tokenizationSpecification: {
              type: "PAYMENT_GATEWAY",
              // Check with your payment gateway on the parameters to pass.
              // @see {@link https://developers.google.com/pay/api/web/reference/object#Gateway}
              parameters: {
                gateway: "stripe",
                "stripe:version": "2018-10-31",
                "stripe:publishableKey": "pk_test_iXTtAi8P5cgAHRtHKBGS0ovA"
              }
            }
          }
        ]
      };
    }

    /**
     * Create a PaymentRequest
     *
     * @returns {PaymentRequest}
     */
    function createPaymentRequest() {
      // Add support for the Google Pay API.
      const methodData = [
        {
          supportedMethods: "https://google.com/pay", // Qualifies for pre-filled SAQ A, since only a token is returned.
          data: getGooglePaymentsConfiguration()
        }
      ];
      // Add other supported payment methods.
      // methodData.push({
      //   supportedMethods: "basic-card", // Usage of basic-card requires SAQ A-EP because raw card details are returned to the client application.
      //   data: {
      //     supportedNetworks: Array.from(allowedCardNetworks, network =>
      //       network.toLowerCase()
      //     )
      //   }
      // });

      const details = {
        total: {
          label: "Test Purchase",
          amount: { currency: "USD", value: "1.00" }
        }
      };

      const options = {
        requestPayerEmail: true,
        requestPayerName: true
      };

      return new PaymentRequest(methodData, details, options);
    }

    /**
     * Show a PaymentRequest dialog after a user clicks the checkout button
     */
    function onBuyClicked() {
      createPaymentRequest()
        .show()
        .then(function(response) {
          // Dismiss payment dialog.
          response.complete("success");
          console.log(response);
        })
        .catch(function(err) {
          console.log("show() error! " + err.name + " error: " + err.message);
        });
    }

    // CanMake payment?
    if (window.PaymentRequest) {
      const request = createPaymentRequest();

      request
        .canMakePayment()
        .then(
          function(result) {
            if (result) {
              // Display PaymentRequest dialog on interaction with the existing checkout button
              this.button_.addEventListener("click", onBuyClicked);
            }
          }.bind(this)
        )
        .catch(function(err) {
          console.log(
            "canMakePayment() error! " + err.name + " error: " + err.message
          );
        });
    } else {
      console.log("PaymentRequest API not available.");
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.RESPONSIVE;
  }
}

AMP.extension("amp-payment-request", "0.1", AMP => {
  AMP.registerElement("amp-payment-request", AmpPaymentRequest);
});
