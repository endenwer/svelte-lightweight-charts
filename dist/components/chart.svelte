<svelte:options immutable={true}/>

<script >import { createEventDispatcher } from 'svelte';
import { element } from './internal/element.js';
import ContextProvider from './internal/context-provider.svelte';
import { chart } from '../internal/chart.js';
const dispatch = createEventDispatcher();
export let container = undefined;
/** Height of the chart */
export let width = 0;
/** Width of the chart */
export let height = 0;
/**
 * Setting this flag to `true` will make the chart watch the chart container's size and automatically resize the chart to fit its container whenever the size changes.
 *
 * This feature requires [`ResizeObserver`](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) class to be available in the global scope.
 * Note that calling code is responsible for providing a polyfill if required. If the global scope does not have `ResizeObserver`, a warning will appear and the flag will be ignored.
 *
 * Please pay attention that `autoSize` option and explicit sizes options `width` and `height` don't conflict with one another.
 * If you specify `autoSize` flag, then `width` and `height` options will be ignored unless `ResizeObserver` has failed. If it fails then the values will be used as fallback.
 *
 * The flag `autoSize` could also be set with and unset with `applyOptions` function.
 * ```js
 * const chart = LightweightCharts.createChart(document.body, {
 *     autoSize: true,
 * });
 * ```
 */
export let autoSize = undefined;
/** Structure with watermark options */
export let watermark = undefined;
/** Structure with layout options */
export let layout = undefined;
/** Structure with price scale option for left price scale */
export let leftPriceScale = undefined;
/** Structure with price scale option for right price scale */
export let rightPriceScale = undefined;
/** Structure describing default price scale options for overlays */
export let overlayPriceScales = undefined;
/** Structure with time scale options */
export let timeScale = undefined;
/** Structure with crosshair options */
export let crosshair = undefined;
/** Structure with grid options */
export let grid = undefined;
/** Structure with localization options */
export let localization = undefined;
/** Structure that describes scrolling behavior or boolean flag that disables/enables all kinds of scrolls */
export let handleScroll = undefined;
/** Structure that describes scaling behavior or boolean flag that disables/enables all kinds of scales */
export let handleScale = undefined;
/** Kinetic scroll options */
export let kineticScroll = undefined;
export let trackingMode = undefined;
export let ref = undefined;
let options = undefined;
$: options = {
    width,
    height,
    autoSize,
    watermark,
    layout,
    leftPriceScale,
    rightPriceScale,
    overlayPriceScales,
    timeScale,
    crosshair,
    grid,
    localization,
    handleScroll,
    handleScale,
    kineticScroll,
    trackingMode,
};
let reference = null;
let handleReference = undefined;
$: handleReference = ((ref) => (chart) => {
    reference = chart;
    if (ref !== undefined) {
        ref(chart);
    }
})(ref);
// Dom container attributes
let attrs = {};
$: {
    attrs = Object.assign({}, container);
    delete attrs.ref;
}
function handleCrosshairMove(params) {
    dispatch('crosshairMove', params);
}
function handleClick(params) {
    dispatch('click', params);
}
</script>

<div
    {...attrs}
    style={autoSize ? attrs.style : (`width: ${width}px; height: ${height}px;` + attrs.style)}
    use:element={container ? container.ref : undefined}
    use:chart={{
        options,
        onCrosshairMove: handleCrosshairMove,
        onClick: handleClick,
        reference: handleReference,
    }}
>
    {#if reference !== null}
        <ContextProvider value={reference}><slot/></ContextProvider>
    {/if}
</div>
