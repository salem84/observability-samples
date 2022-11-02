using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenTelemetry.Trace;
using OpenTelemetry.Logs;
using Microsoft.Extensions.Logging;
using System;

namespace PrimeCalculator.PrimeConsumer
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddHostedService<Worker>();

                    // Configure OpenTelemetry tracing
                    services.AddOpenTelemetryTracing(builder =>
                    {
                        builder.AddAspNetCoreInstrumentation();
                        builder.AddSource("PrimeConsumerDotNetCoreActivitySource");
                        builder.AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:4317"));
                    });

                    
                })
            .ConfigureLogging((context, logging) =>
            {
                // Configure OpenTelemetry logging
                logging.AddOpenTelemetry(options =>
                {
                    options.IncludeFormattedMessage = true;
                    options.IncludeScopes = true;
                    options.ParseStateValues = true;

                    // From OpenTelemetry.Exporter.OpenTelemetryProtocol.Logs package
                    options.AddOtlpExporter(options => options.Endpoint = new Uri("http://localhost:4317"));
                });
            });
    }
}
