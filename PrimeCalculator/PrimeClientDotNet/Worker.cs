using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeCalculator.PrimeClientDotNet
{
    public class Worker : BackgroundService
    {
        private const string MIN_NUMBER_VARIABLE = "MIN_NUMBER";
        private const string MAX_NUMBER_VARIABLE = "MAX_NUMBER";
        private const string INTERVAL_MS = "INTERVAL_MS";

        private readonly ILogger<Worker> _logger;
        private readonly PrimeCalculator.PrimeCalculatorClient _primeClient;

        public Worker(ILogger<Worker> logger, PrimeCalculator.PrimeCalculatorClient primeClient)
        {
            _logger = logger;
            _primeClient = primeClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            //Giving time for all other services/dependencies to be warmed up (ex: RabbitMQ takes time to boot up)
            await Task.Delay(TimeSpan.FromSeconds(33), stoppingToken);
            _logger.LogInformation("Starting to send Prime number requests.......");

            var minNum = Convert.ToInt32(Environment.GetEnvironmentVariable(MIN_NUMBER_VARIABLE));
            var maxNum = Convert.ToInt32(Environment.GetEnvironmentVariable(MAX_NUMBER_VARIABLE));
            var interval = Convert.ToInt32(Environment.GetEnvironmentVariable(INTERVAL_MS));

            _logger.LogInformation($"Evaluating from {minNum} to {maxNum}");

            Random r = new Random();
            while (!stoppingToken.IsCancellationRequested)
            {
                var input = r.Next(minNum, maxNum);
                try
                {
                    var response = await _primeClient.IsItPrimeAsync(new PrimeRequest { Number = input });
                    _logger.LogInformation($"Is {input} a Prime number? Service tells us: {response.IsPrime}\r");
                }
                catch (Exception ex)
                {
                    if (stoppingToken.IsCancellationRequested) return;
                    _logger.LogError(-1, ex, "Error occurred while calling IsItPrimeAsync() but will continue..");
                    await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); //just adding some delay in case of error..
                }

                //minNum++;
                //if (minNum >= maxNum) break;

                if (stoppingToken.IsCancellationRequested) break;

                await Task.Delay(TimeSpan.FromMilliseconds(interval), stoppingToken);
            }
        }
    }
}
