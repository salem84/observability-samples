using PrimeCalculator.PrimeConsumer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace PrimeConsumer48
{
    internal class Program
    {
        static async void Main(string[] args)
        {
            var cts = new CancellationTokenSource();
            Console.CancelKeyPress += (s, e) =>
            {
                Console.WriteLine("Canceling...");
                cts.Cancel();
                e.Cancel = true;
            };

            var worker = new Worker();
            await worker.StartAsync(cts.Token);
            await worker.ExecuteAsync(cts.Token);
        }
    }
}
