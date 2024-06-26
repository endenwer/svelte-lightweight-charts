export function series(target, params) {
    let subject = createSeries(target, params);
    let reference;
    let data = params.reactive ? params.data : null;
    let markers = params.markers;
    return {
        update(nextParams) {
            if (nextParams.type !== subject.seriesType()) {
                target.removeSeries(subject);
                reference === null || reference === void 0 ? void 0 : reference(null);
                subject = createSeries(target, nextParams);
                reference === null || reference === void 0 ? void 0 : reference(subject);
                return;
            }
            if (nextParams.options) {
                subject.applyOptions(nextParams.options);
            }
            if (!nextParams.reactive) {
                data = null;
            }
            if (nextParams.data !== data && nextParams.reactive) {
                data = nextParams.data;
                subject.setData(data);
            }
            if (nextParams.markers !== markers) {
                markers = nextParams.markers;
                subject.setMarkers(markers);
            }
        },
        updateReference(nextReference) {
            if (nextReference !== reference) {
                reference === null || reference === void 0 ? void 0 : reference(null);
                reference = nextReference;
                reference === null || reference === void 0 ? void 0 : reference(subject);
            }
        },
        destroy() {
            reference === null || reference === void 0 ? void 0 : reference(null);
            try {
                target.removeSeries(subject);
            }
            catch (e) { }
        }
    };
}
function createSeries(chart, params) {
    switch (params.type) {
        case 'Area': {
            const series = chart.addAreaSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
        case 'Bar': {
            const series = chart.addBarSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
        case 'Candlestick': {
            const series = chart.addCandlestickSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
        case 'Histogram': {
            const series = chart.addHistogramSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
        case 'Line': {
            const series = chart.addLineSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
        case 'Baseline': {
            const series = chart.addBaselineSeries(params.options);
            series.setData(params.data);
            series.setMarkers(params.markers);
            return series;
        }
    }
}
