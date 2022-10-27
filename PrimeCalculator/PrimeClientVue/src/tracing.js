import { context, trace, SpanStatusCode } from "@opentelemetry/api";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { Resource } from "@opentelemetry/resources";
import { SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { CollectorTraceExporter } from "@opentelemetry/exporter-collector";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

const serviceName = "link-frontend";

const resource = new Resource({ "service.name": serviceName });
const provider = new WebTracerProvider({ resource });

const collector = new CollectorTraceExporter({
    url: "http://localhost:4318/v1/traces",
});

provider.addSpanProcessor(new SimpleSpanProcessor(collector));
provider.register({ contextManager: new ZoneContextManager() });

const webTracerWithZone = provider.getTracer(serviceName);

var bindingSpan;

window.startBindingSpan = (
    traceId,
    spanId,
    traceFlags,
) => {
    bindingSpan = webTracerWithZone.startSpan("");
    bindingSpan.spanContext().traceId = traceId;
    bindingSpan.spanContext().spanId = spanId;
    bindingSpan.spanContext().traceFlags = traceFlags;
};

registerInstrumentations({
    instrumentations: [
        new FetchInstrumentation({
            propagateTraceHeaderCorsUrls: ["/.*/g"],
            clearTimingResources: true,
            applyCustomAttributesOnSpan: (
                span,
                request,
                result,
            ) => {
                const attributes = span.attributes;
                if (attributes.component === "fetch") {
                    span.updateName(
                        `${attributes["http.method"]} ${attributes["http.url"]}`
                    );
                }
                if (result instanceof Error) {
                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: result.message,
                    });
                    span.recordException(result.stack || result.name);
                }
            },
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