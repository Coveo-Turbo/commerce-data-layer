import {
  Component,
  IComponentBindings,
  ComponentOptions,
  IChangeAnalyticsCustomDataEventArgs,
  IDisplayedNewResultEventArgs,
  ResultListEvents,
  IStringMap,
  QueryEvents,
  IQuerySuccessEventArgs,
  AnalyticsEvents,
} from "coveo-search-ui";

import { CommerceDataLayerEvents } from "./CommerceDataLayerEvents";
import { lazyComponent } from "@coveops/turbo-core";

declare var window: any;

export interface ICommerceDataLayerProduct {
  id: String;
  name: String;
  price?: Number;
  brand?: String;
  category?: String;
  variant?: String;
  position?: String;
  url?: String;
  list?: String;
}

export interface ICommerceDataLayerOptions {
  productFormatter: ({}) => ICommerceDataLayerProduct;
}

@lazyComponent
export class CommerceDataLayer extends Component {
  static ID = "CommerceDataLayer";
  static options: ICommerceDataLayerOptions = {
    productFormatter: ComponentOptions.buildCustomOption(({}) => null),
  };

  private searchUid: String;
  private displayedProducts: ICommerceDataLayerProduct[] = [];

  constructor(
    public element: HTMLElement,
    public options: ICommerceDataLayerOptions,
    public bindings: IComponentBindings
  ) {
    super(element, CommerceDataLayer.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(
      element,
      CommerceDataLayer,
      options
    );

    if (typeof this.options.productFormatter == "function") {
      // Ensure that we have a valid dataLayer
      window.dataLayer = window.dataLayer || [];

      // Query Success
      this.bind.onRootElement(
        QueryEvents.querySuccess,
        (args: IQuerySuccessEventArgs) => this.handleQuerySuccess(args)
      );

      // Analytics Events
      this.bind.onRootElement(
        AnalyticsEvents.changeAnalyticsCustomData,
        (args: IChangeAnalyticsCustomDataEventArgs) =>
          this.handleChangeAnalyticsCustomData(args)
      );

      // ResultList Events
      this.bind.onRootElement(
        ResultListEvents.newResultDisplayed,
        (args: IDisplayedNewResultEventArgs) =>
          this.handleNewResultDisplayed(args)
      );
      this.bind.onRootElement(ResultListEvents.newResultsDisplayed, () =>
        this.handleNewResultsDisplayed()
      );

      // Commerce Data Layer Events
      this.bind.onRootElement(
        CommerceDataLayerEvents.productClick,
        (args: IStringMap<any>) => this.handleProductClick(args)
      );
      this.bind.onRootElement(
        CommerceDataLayerEvents.productDetail,
        (args: IStringMap<any>) => this.handleProductDetail(args)
      );
      this.bind.onRootElement(
        CommerceDataLayerEvents.addToCart,
        (args: IStringMap<any>) => this.handleAddToCart(args)
      );
      this.bind.onRootElement(
        CommerceDataLayerEvents.removeFromCart,
        (args: IStringMap<any>) => this.handleRemoveFromCart(args)
      );
    } else {
      this.logger.error("Missing valid function for productFormatter option.");
    }
  }

  public pushToDataLayer(commerceActivity: IStringMap<any>) {
    try {
      this.logger.info("Pushing to dataLayer.", commerceActivity);
      window.dataLayer.push(commerceActivity);
    } catch (error) {
      this.logger.error("Cannot push to dataLayer.");
    }
  }

  /**
   * Query Success
   */
  private handleQuerySuccess(args: IQuerySuccessEventArgs) {
    this.searchUid = args.results.searchUid;

    this.handleSearch(args);
  }

  /**
   * Change Analytics Custom Data
   */
  public handleChangeAnalyticsCustomData(
    args: IChangeAnalyticsCustomDataEventArgs
  ) {
    if (args.type === "ClickEvent" && args.actionCause != "addToCart") {
      let product: ICommerceDataLayerProduct = this.options.productFormatter(
        args["resultData"]
      );

      this.pushToDataLayer({
        event: "productClick",
        ecommerce: {
          click: {
            actionField: { list: `coveo:search:${this.searchUid}` },
            products: [product],
          },
        },
        eventCallback: function () {
          // document.location = product.url;
        },
      });
    }
  }

  public handleNewResultDisplayed(args: IDisplayedNewResultEventArgs) {
    let product: ICommerceDataLayerProduct = this.options.productFormatter(
      args.result
    );

    product.list = `coveo:search:${this.searchUid}`;

    this.displayedProducts.push(product);
  }

  public handleNewResultsDisplayed() {
    this.pushToDataLayer({
      // coveoSearchUid: this.searchUid,
      ecommerce: {
        impressions: this.displayedProducts,
      },
    });
  }

  public handleSearch(args: IQuerySuccessEventArgs) {
    // this.pushToDataLayer({
    //   event: "search",
    //   search_term: query,
    // });

    this.pushToDataLayer({
      event: "coveo-search-data-loaded",
      "search-data": {
        q: args.query.q,
        searchUid: this.searchUid,
        count: args.results.totalCount,
      },
    });
  }

  public handleProductClick(args: IStringMap<any>) {
    let product: ICommerceDataLayerProduct = this.options.productFormatter(
      args
    );

    this.pushToDataLayer({
      event: "productClick",
      ecommerce: {
        click: {
          actionField: { list: `coveo:search:${this.searchUid}` },
          products: [product],
        },
      },
      eventCallback: function () {
        // document.location = args.url
      },
    });
  }

  public handleProductDetail(args: IStringMap<any>) {
    let product: ICommerceDataLayerProduct = this.options.productFormatter(
      args
    );

    this.pushToDataLayer({
      coveoSearchUid: this.searchUid,
      ecommerce: {
        detail: {
          actionField: { list: `coveo:search:${this.searchUid}` },
          products: [product],
        },
      },
    });
  }

  // Adding a Product to a Shopping Cart
  public handleAddToCart(args: IStringMap<any>) {
    let product: ICommerceDataLayerProduct = this.options.productFormatter(
      args
    );

    this.pushToDataLayer({
      event: "addToCart",
      ecommerce: {
        add: {
          actionField: { list: `coveo:search:${this.searchUid}` },
          products: [product],
        },
      },
    });
  }

  public handleRemoveFromCart(args: IStringMap<any>) {
    let product: ICommerceDataLayerProduct = this.options.productFormatter(
      args
    );

    this.pushToDataLayer({
      event: "removeFromCart",
      coveoSearchUid: this.searchUid,
      ecommerce: {
        remove: {
          actionField: { list: `coveo:search:${this.searchUid}` },
          products: [product],
        },
      },
    });
  }
}
