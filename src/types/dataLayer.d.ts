declare module dataLayer {
  function push({}): void;
}

declare module "dataLayer" {
	export = dataLayer;
}