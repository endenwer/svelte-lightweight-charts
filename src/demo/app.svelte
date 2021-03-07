<svelte:options immutable={true}/>

<script lang="ts">
    import type {
        IChartApi,
        ISeriesApi,
        MouseEventParams,
        PriceLineOptions,
        SeriesType,
        ChartOptions,
        DeepPartial,
    } from 'lightweight-charts';
    import type {
        HistogramSeriesParams,
        SeriesActionParams
    } from '../types';
    import {LineStyle} from 'lightweight-charts';
    import type {ChartActionParams} from '../index';
    import {chart} from '../index';
    import {BAR_DATA, HISTOGRAM_DATA, LINE_DATA} from '../data-series';
    import {onMount} from 'svelte';

    import Chart from '../components/chart.svelte';
    import LineSeries from '../components/line-series.svelte';
    import AreaSeries from '../components/area-series.svelte';
    import HistogramSeries from '../components/histogram-series.svelte';
    import BarSeries from '../components/bar-series.svelte';
    import CandlestickSeries from '../components/candlestick-series.svelte';

    type EverySeriesApi =
        | ISeriesApi<'Area'>
        | ISeriesApi<'Bar'>
        | ISeriesApi<'Histogram'>
        | ISeriesApi<'Candlestick'>
        | ISeriesApi<'Line'>
        ;

    const SERIES_TYPES: SeriesType[] = ['Area', 'Bar', 'Histogram', 'Candlestick', 'Line'];

    let width = 400;
    let height = 300;

    let options: DeepPartial<ChartOptions>;
    $: options = {
        width,
        height,
    };

    let seriesType: SeriesType = 'Area';

    let start: Date;
    let day: Date;
    let mainProps: SeriesActionParams;
    let volumeProps: HistogramSeriesParams;

    $: {
        mainProps = createMainSeriesProps(seriesType);
        volumeProps = createVolumeProps();
        start = day = new Date(2019, 5, 29);
    }

    let mainSeries: EverySeriesApi | null = null;
    let volume: ISeriesApi<'Histogram'> | null = null;

    let mainSeriesComponent: EverySeriesApi | null = null;
    let volumeComponent: ISeriesApi<'Histogram'> | null = null;

    $: if (start !== day) {
        updateSeriesData(mainSeries, day);
        updateVolumeData(volume, day);

        updateSeriesData(mainSeriesComponent, day);
        updateVolumeData(volumeComponent, day);
    }

    let intraday = false;
    let ticker: number | null = null;

    $: if (ticker !== null) {
        setupTicker(!intraday);
    }

    let params: ChartActionParams<[SeriesActionParams, HistogramSeriesParams]>;

    $: params = {
        options,
        series: [mainProps, volumeProps],
        reference: handleReference,
        onClick: handleClick,
        onCrosshairMove: handleCrosshairMove,
    };

    let api: IChartApi | null = null;
    let drawMode: 'draw-priceline' | null = null;

    onMount(() => {
        window.addEventListener('mousedown', handleClickStart, true);
        window.addEventListener('mouseup', handleClickEnd);
        return () => {
            window.removeEventListener('mousedown', handleClickStart, true);
            window.removeEventListener('mouseup', handleClickEnd);
        }
    })

    function handleClick(e: MouseEventParams): void {
        const {point} = e;
        if (point === undefined) {
            return;
        }
        if (mainSeries === null) {
            return;
        }
        const price = mainSeries.coordinateToPrice(point.y);
        if (price === null) {
            return;
        }

        switch (drawMode) {
            case 'draw-priceline': {
                const line: PriceLineOptions = {
                    price: price,
                    color: '#be1238',
                    lineWidth: 2,
                    lineStyle: LineStyle.Solid,
                    axisLabelVisible: true,
                    title: 'limit',
                };
                mainProps = shallowCopy(mainProps)
                mainProps.priceLines = [line];
                break;
            }
        }
    }

    function handleCrosshairMove(): void {
        // eslint-disable-next-line no-console
        console.log('move');
    }

    function handleReference(ref: IChartApi | null): void {
        api = ref;
    }

    function handleFitContent(): void {
        api?.timeScale().fitContent();
    }

    function handleClickStart(e: MouseEvent): void {
        drawMode = e.ctrlKey ? 'draw-priceline' : null;
    }

    function handleClickEnd(): void {
        drawMode = null;
    }

    function handleTicker(): void {
        if (ticker !== null) {
            clearTicker();
        } else {
            setupTicker(!intraday);
        }
    }

    function clearTicker(): void {
        if (ticker !== null) {
            clearInterval(ticker);
            ticker = null;
        }
    }

    function setupTicker(daily: boolean = true): void {
        if (ticker !== null) {
            clearTicker();
        }
        if (daily) {
            ticker = setInterval(
                () => {
                    day.setDate(day.getDate() + 1);
                    day = new Date(day);
                },
                1000
            );
        } else {
            ticker = setInterval(
                () => {
                    day.setHours(day.getHours() + 6);
                    day = new Date(day);
                },
                250
            );
        }
    }

    function createMainSeriesProps(type: SeriesType): SeriesActionParams {
        switch (type) {
            case 'Area':
                return {
                    id: 'main',
                    type,
                    data: LINE_DATA,
                    reference: (ref: ISeriesApi<'Area'> | null) => {
                        mainSeries = ref;
                    }
                }
            case 'Line':
                return {
                    id: 'main',
                    type,
                    data: LINE_DATA,
                    reference: (ref: ISeriesApi<'Line'> | null) => {
                        mainSeries = ref;
                    }
                }
            case 'Bar':
                return {
                    id: 'main',
                    type,
                    data: BAR_DATA,
                    reference: (ref: ISeriesApi<'Bar'> | null) => {
                        mainSeries = ref;
                    },
                }
            case 'Candlestick':
                return {
                    id: 'main',
                    type,
                    data: BAR_DATA,
                    reference: (ref: ISeriesApi<'Candlestick'> | null) => {
                        mainSeries = ref;
                    },
                }
            case 'Histogram':
                return {
                    id: 'main',
                    type,
                    data: HISTOGRAM_DATA,
                    reference: (ref: ISeriesApi<'Histogram'> | null) => {
                        mainSeries = ref;
                    },
                }
            default:
                throw new Error();
        }
    }

    function createVolumeProps(): HistogramSeriesParams {
        return {
            id: 'volume-' + performance.now(),
            type: 'Histogram',
            options: {
                color: '#26a69a',
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: '',
                scaleMargins: {
                    top: 0.8,
                    bottom: 0,
                },
            },
            data: HISTOGRAM_DATA,
            reference: (ref: ISeriesApi<'Histogram'> | null) => volume = ref,
        }
    }

    function updateSeriesData(api: EverySeriesApi | null, date: Date): void {
        if (api === null) {
            return
        }
        if (containsLineData(api)) {
            api.update({time: date.toISOString().slice(0, 10), value: 90 - 20 * Math.random()})
        }
        if (containsBarData(api)) {
            api.update({
                time: date.toISOString().slice(0, 10),
                open: 194.38 - 20 * Math.random(),
                high: 196.47 - 20 * Math.random(),
                low: 193.75 - 20 * Math.random(),
                close: 194.08 - 20 * Math.random()
            });
        }
        if (containsHistogramData(api)) {
            api.update({time: date.toISOString().slice(0, 10), value: 90 - 20 * Math.random()})
        }
    }

    function containsLineData(api: EverySeriesApi): api is ISeriesApi<'Line'> | ISeriesApi<'Area'> {
        return api.seriesType() === 'Line' || api.seriesType() === 'Area';
    }

    function containsBarData(api: EverySeriesApi): api is ISeriesApi<'Bar'> | ISeriesApi<'Candlestick'> {
        return api.seriesType() === 'Bar' || api.seriesType() === 'Candlestick';
    }

    function containsHistogramData(api: EverySeriesApi): api is ISeriesApi<'Histogram'> {
        return api.seriesType() === 'Histogram';
    }

    function updateVolumeData(api: ISeriesApi<'Histogram'> | null, date: Date): void {
        api?.update({time: date.toISOString().slice(0, 10), value: (20097125.00 - Math.random() * 10000000)});
    }

    function shallowCopy<T extends object>(value: T): T {
        return {...value};
    }

    function handleMainComponentReference(ref: EverySeriesApi | null): void {
        mainSeriesComponent = ref;
    }

    function handleVolumeComponentReference(ref: ISeriesApi<'Histogram'> | null): void {
        volumeComponent = ref;
    }
</script>

<form>
    <fieldset name="navigation">
        <legend>Navigation:</legend>
        <a href="/official-samples.html">Official samples gallery</a>
    </fieldset>
    <fieldset name="size">
        <legend>Size options:</legend>
        <label>
            Width:
            <input type="range" bind:value={width} name="width" id="width" min="100" max="1000" step="50">
            {width}
        </label>
        <label>
            Height:
            <input type="range" bind:value={height} name="height" id="height" min="100" max="1000" step="50">
            {height}
        </label>
    </fieldset>
    <fieldset name="series">
        <legend>Main Series type:</legend>
        {#each SERIES_TYPES as type (type) }
            <label>
                <input type="radio" name="series-type" value={type} bind:group={seriesType}> {type}
            </label>
        {/each}
    </fieldset>
    <fieldset name="controller">
        <legend>Controller options:</legend>
        <label>
            <input type="checkbox" name="intraday" id="intraday" bind:checked={intraday}> Intraday
        </label>
        <button on:click={handleTicker} type="button">{ ticker ? 'Stop' : 'Start' }</button>
        <button on:click={handleFitContent} type="button">Fit content</button>
    </fieldset>
    <fieldset name="chart-action">
        <legend>Chart action:</legend>
        <section use:chart={params}></section>
    </fieldset>
    <fieldset name="chart-component">
        <legend>Chart component:</legend>
        <Chart {...(params.options ?? {})}>
            {#if mainProps.type === 'Area' }
                <AreaSeries
                    {...(mainProps.options ?? {})}
                    data={mainProps.data}
                    ref={handleMainComponentReference}
                />
            {/if}
            {#if mainProps.type === 'Line' }
                <LineSeries
                    {...(mainProps.options ?? {})}
                    data={mainProps.data}
                    ref={handleMainComponentReference}
                />
            {/if}
            {#if mainProps.type === 'Histogram'}
                <HistogramSeries
                    {...(mainProps.options ?? {})}
                    data={mainProps.data}
                    ref={handleMainComponentReference}
                />
            {/if}
            {#if mainProps.type === 'Bar'}
                <BarSeries
                    {...(mainProps.options ?? {})}
                    data={mainProps.data}
                    ref={handleMainComponentReference}
                />
            {/if}
            {#if mainProps.type === 'Candlestick'}
                <CandlestickSeries
                    {...(mainProps.options ?? {})}
                    data={mainProps.data}
                    ref={handleMainComponentReference}
                />
            {/if}
            <HistogramSeries
                {...(volumeProps.options ?? {})}
                data={volumeProps.data}
                ref={handleVolumeComponentReference}
            />
        </Chart>
    </fieldset>
</form>


<style>

</style>