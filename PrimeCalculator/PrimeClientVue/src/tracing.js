import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { Resource } from "@opentelemetry/resources";
import { ConsoleSpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
// import { CollectorTraceExporter } from "@opentelemetry/exporter-collector";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { XMLHttpRequestInstrumentation } from "@opentelemetry/instrumentation-xml-http-request";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

const serviceName = "link-frontend";

const resource = new Resource({ "service.name": serviceName });
const provider = new WebTracerProvider({ resource });

// const collector = new CollectorTraceExporter({
//     url: "http://localhost:4318/v1/traces",
// });

// provider.addSpanProcessor(new SimpleSpanProcessor(collector));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.addSpanProcessor(new SimpleSpanProcessor(new OTLPTraceExporter()));

provider.register({ 
    contextManager: new ZoneContextManager(),
    propagator: new W3CTraceContextPropagator(),
});

// propagation.setGlobalPropagator(new W3CTraceContextPropagator());

const webTracerWithZone = provider.getTracer(serviceName);

var bindingSpan;

// window.startBindingSpan = (
//     traceId,
//     spanId,
//     traceFlags,
// ) => {
//     bindingSpan = webTracerWithZone.startSpan("");
//     bindingSpan.spanContext().traceId = traceId;
//     bindingSpan.spanContext().spanId = spanId;
//     bindingSpan.spanContext().traceFlags = traceFlags;
// };

registerInstrumentations({
    instrumentations: [
        new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: [
                'https://cors-test.appspot.com/test',
                'https://httpbin.org/get',
                "/.*/g"
            ],
            clearTimingResources: true,
            // applyCustomAttributesOnSpan: (
            //     span,
            //     request,
            //     result,
            // ) => {
            //     const attributes = span.attributes;
            //     if (attributes.component === "fetch") {
            //         span.updateName(
            //             `${attributes["http.method"]} ${attributes["http.url"]}`
            //         );
            //     }
            //     if (result instanceof Error) {
            //         span.setStatus({
            //             code: SpanStatusCode.ERROR,
            //             message: result.message,
            //         });
            //         span.recordException(result.stack || result.name);
            //     }
            // },
        }),
        //For Axios Library Instrumentation
        new XMLHttpRequestInstrumentation({
            ignoreUrls: [/localhost:8080\/sockjs-node/],
            propagateTraceHeaderCorsUrls: [
              'https://httpbin.org/get',
            ],
          }),
    ],
});

export function traceSpan(
    name,
    func
) {
    var singleSpan;
    if (bindingSpan) {
        const ctx = trace.setSpan(context.active(), bindingSpan);
        singleSpan = webTracerWithZone.startSpan(name, undefined, ctx);
        bindingSpan = undefined;
    } else {
        singleSpan = webTracerWithZone.startSpan(name);
    }
    return context.with(trace.setSpan(context.active(), singleSpan), () => {
        try {
            const result = func();
            singleSpan.end();
            return result;
        } catch (error) {
            singleSpan.setStatus({ code: SpanStatusCode.ERROR });
            singleSpan.end();
            throw error;
        }
    });
}