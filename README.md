# CommerceDataLayer

For usage analytics, the commerce activities can be tracked using a data layer. This component will bind itself on ootb and custom events. The Analytics Events changeAnalyticsCustomData handles product click. The ResultList Events newResultDisplayed & newResultsDisplayed handle the products impressions. The Commerce Data Layer Events handle product click, product detail, add to cart and remove to cart.

Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/commerce-data-layer
```

2. Use the Component or extend it

Typescript:

```javascript
import { CommerceDataLayer, ICommerceDataLayerOptions } from '@coveops/commerce-data-layer';
```

Javascript

```javascript
const CommerceDataLayer = require('@coveops/commerce-data-layer').CommerceDataLayer;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/commerce-data-layer'
```

4. Or for quick testing, you can add the script from unpkg

```html
<script src="https://unpkg.com/@coveops/commerce-data-layer@latest/dist/index.min.js"></script>
```

> Disclaimer: Unpkg should be used for testing but not for production.

5. Include the component in your template as follows:

Place the component in your markup:

```html
<div class="CoveoCommerceDataLayer"></div>
```

Set the component option in your script:

```javascript
Coveo.init(document.getElementById("search"), {  
    CommerceDataLayer: {
        productFormatter: function (result) {
            let product = {
                id: undefined,
                name: undefined,
                price: undefined,
                brand: undefined,
                category: undefined,
                variant: undefined,
                position: undefined,
                url: undefined
            };

            try {
                let raw = result.raw;

                // Id
                product.id = raw['sku'];

                // Name
                product.name = result['title'];
            } catch (error) {}

            return product;
        },
    },
});
```

## Extending

Extending the component can be done as follows:

```javascript
import { CommerceDataLayer, ICommerceDataLayerOptions } from "@coveops/commerce-data-layer";

export interface IExtendedCommerceDataLayerOptions extends ICommerceDataLayerOptions {}

export class ExtendedCommerceDataLayer extends CommerceDataLayer {}
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`