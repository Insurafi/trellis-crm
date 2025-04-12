import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Check, Info, Award, BookOpen, HelpCircle, ThumbsUp, AlertCircle, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  quiz: QuizQuestion[];
}

export default function TrainingPage() {
  const [selectedModule, setSelectedModule] = useState<string>("term");
  const [quizMode, setQuizMode] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  
  // Training modules
  const trainingModules: TrainingModule[] = [
    {
      id: "term",
      title: "Term Life Insurance",
      description: "Learn the basics of term life insurance, its benefits, and how to explain it to clients.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">What is Term Life Insurance?</h3>
            <p className="mt-2 text-muted-foreground">
              Term life insurance provides coverage for a specific period or "term" (typically 10, 15, 20, or 30 years). 
              If the policyholder passes away during this term, a death benefit is paid to the beneficiaries. 
              If the policyholder outlives the term, coverage expires with no benefit.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Lower Premiums:</span> Generally the most affordable type of life insurance.</li>
              <li><span className="font-medium">Fixed Period:</span> Provides coverage for a specific term (not lifetime).</li>
              <li><span className="font-medium">No Cash Value:</span> Purely death benefit protection without investment components.</li>
              <li><span className="font-medium">Renewable:</span> Many policies offer the option to renew at the end of the term (at a higher premium).</li>
              <li><span className="font-medium">Convertible:</span> Many term policies can be converted to permanent insurance.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="ideal-clients">
              <AccordionTrigger className="px-4">Ideal Clients for Term Life</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Young families needing maximum coverage at affordable rates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Couples with mortgages or other large debts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Parents who want coverage until children are financially independent</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Business owners covering specific business loans or obligations</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Sales Tips</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on the affordability and high coverage amount</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Explain how it can cover specific financial obligations (mortgage, education)</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Discuss conversion options for future flexibility</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Use "laddering" to provide varying coverage amounts over time</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="objection-handling">
              <AccordionTrigger className="px-4">Common Objections & Responses</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Objection: "What if I outlive the term?"</p>
                    <p className="text-muted-foreground ml-6">Response: "That's actually good news! It means you've lived a long life. The purpose of term insurance is to protect your family during those critical years when they're most financially vulnerable."</p>
                  </div>
                  <div>
                    <p className="font-medium">Objection: "I'd rather invest my money than buy insurance."</p>
                    <p className="text-muted-foreground ml-6">Response: "Investment and insurance serve different purposes. Term insurance provides immediate financial protection that investments can't match in the early years. It's not an either/or decision, but rather part of a balanced financial strategy."</p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important to remember</AlertTitle>
            <AlertDescription>
              Term insurance is best presented as part of a complete financial plan, not as a standalone product. 
              Always make sure clients understand that premiums will increase significantly if they renew after the term expires.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What is the primary feature of term life insurance?",
          options: [
            "It builds cash value over time",
            "It provides coverage for a specific period of time",
            "It cannot be converted to permanent insurance",
            "It always includes investment components"
          ],
          correctAnswer: 1
        },
        {
          question: "Which clients are typically BEST suited for term life insurance?",
          options: [
            "Retirees looking for estate planning",
            "Young families with mortgages and dependent children",
            "Wealthy individuals seeking tax advantages",
            "Business owners planning business succession"
          ],
          correctAnswer: 1
        },
        {
          question: "What typically happens at the end of a term life policy's term if the insured is still alive?",
          options: [
            "The policy automatically converts to whole life",
            "The death benefit is paid out in full",
            "The policy expires with no benefit payout",
            "The premiums are refunded to the policyholder"
          ],
          correctAnswer: 2
        },
        {
          question: "What is a 'convertible' term life policy?",
          options: [
            "A policy that can be converted to permanent insurance",
            "A policy that converts premiums to investments",
            "A policy that can be transferred to another person",
            "A policy with automatic premium increases"
          ],
          correctAnswer: 0
        },
        {
          question: "What is 'laddering' in term life insurance?",
          options: [
            "Increasing coverage amounts over time",
            "Having multiple term policies with different end dates",
            "Adding riders to a base policy",
            "Gradually converting term to permanent insurance"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "whole",
      title: "Whole Life Insurance",
      description: "Master whole life insurance concepts, cash value accumulation, and client matching.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">What is Whole Life Insurance?</h3>
            <p className="mt-2 text-muted-foreground">
              Whole life insurance is a permanent life insurance policy that provides coverage for the insured's entire life, 
              as long as premiums are paid. Unlike term insurance, whole life builds cash value over time that can be borrowed against 
              or withdrawn, and includes a guaranteed death benefit.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Lifetime Coverage:</span> Provides protection for the insured's entire life.</li>
              <li><span className="font-medium">Cash Value:</span> Accumulates cash value on a tax-deferred basis.</li>
              <li><span className="font-medium">Fixed Premiums:</span> Premium amounts typically remain level for life.</li>
              <li><span className="font-medium">Dividends:</span> Many whole life policies pay dividends (though not guaranteed).</li>
              <li><span className="font-medium">Loan Provisions:</span> Policyholders can borrow against the cash value.</li>
              <li><span className="font-medium">Guaranteed Death Benefit:</span> The death benefit amount is guaranteed.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="ideal-clients">
              <AccordionTrigger className="px-4">Ideal Clients for Whole Life</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Individuals seeking lifelong protection and cash value accumulation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Clients looking for a conservative investment component with their insurance</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Business owners for key person insurance or buy-sell agreements</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Individuals with estate planning needs</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="cash-value">
              <AccordionTrigger className="px-4">Understanding Cash Value</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-4">Cash value in whole life insurance has several important properties:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Grows tax-deferred over time at a guaranteed minimum rate</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Can be accessed through policy loans or withdrawals (with certain tax implications)</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Policy loans use the cash value as collateral and don't need to be repaid (though they reduce the death benefit if not repaid)</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Cash value may be used to pay premiums after sufficient accumulation</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Sales Tips</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on the permanent protection and guaranteed aspects</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Explain the living benefits through cash value access</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Position as a conservative asset class within a diversified portfolio</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Highlight the potential dividend performance (while noting they're not guaranteed)</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important to remember</AlertTitle>
            <AlertDescription>
              Whole life insurance is a long-term commitment. Make sure clients understand that early surrender can result in significant 
              losses, as cash value takes time to build. The best results come from policies held for 15+ years.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What is a key feature that distinguishes whole life from term life insurance?",
          options: [
            "Lower premiums",
            "Cash value accumulation",
            "Temporary coverage",
            "Declining death benefit"
          ],
          correctAnswer: 1
        },
        {
          question: "How long does whole life insurance provide coverage?",
          options: [
            "For a specific term (10-30 years)",
            "Until retirement age",
            "Until age 65",
            "For the insured's entire lifetime"
          ],
          correctAnswer: 3
        },
        {
          question: "What happens to the cash value in a whole life policy when the insured passes away?",
          options: [
            "It's added to the death benefit",
            "It's paid separately to a designated beneficiary",
            "The insurance company retains it",
            "It's returned to the premium payer"
          ],
          correctAnswer: 2
        },
        {
          question: "What is a policy loan in whole life insurance?",
          options: [
            "A loan from the insurance company using the policy as collateral",
            "A premium payment plan",
            "A loan from the IRS for insurance purposes",
            "A death benefit advance"
          ],
          correctAnswer: 0
        },
        {
          question: "Which of the following is typically NOT a feature of whole life insurance?",
          options: [
            "Fixed premiums",
            "Cash value accumulation",
            "Limited payment periods",
            "Increasing death benefit over time"
          ],
          correctAnswer: 3
        }
      ]
    },
    {
      id: "iul",
      title: "Indexed Universal Life (IUL)",
      description: "Explore the flexible features of IUL policies, market indexes, and ideal client scenarios.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">What is Indexed Universal Life Insurance (IUL)?</h3>
            <p className="mt-2 text-muted-foreground">
              Indexed Universal Life insurance is a type of permanent life insurance that offers flexible premiums, 
              adjustable death benefits, and cash value growth tied to the performance of a market index (like the S&P 500). 
              It provides potential for higher returns than traditional whole life while offering downside protection.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Index-Linked Growth:</span> Cash value growth tied to market index performance.</li>
              <li><span className="font-medium">Downside Protection:</span> Floor guarantees (typically 0-1%) prevent loss of principal in market downturns.</li>
              <li><span className="font-medium">Caps & Participation Rates:</span> Limits on maximum returns through caps or participation rates.</li>
              <li><span className="font-medium">Flexible Premiums:</span> Ability to adjust premium payments within limits.</li>
              <li><span className="font-medium">Adjustable Death Benefit:</span> Option to increase or decrease coverage as needs change.</li>
              <li><span className="font-medium">Tax-Advantaged Growth:</span> Cash value grows tax-deferred and can be accessed tax-free through loans.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="how-indexing-works">
              <AccordionTrigger className="px-4">How Indexing Works</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">IUL policies credit interest based on the performance of a market index, typically with these parameters:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Floor:</strong> Minimum guaranteed interest rate (typically 0-1%) protecting against market losses</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Cap:</strong> Maximum interest rate that can be credited (typically 8-14%, varies by company)</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Participation Rate:</strong> Percentage of index gain that is credited (may be 100% or less)</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Crediting Methods:</strong> Annual point-to-point, monthly average, etc.</span>
                  </li>
                </ul>
                <p className="mt-3">Example: If the S&P 500 gains 15% in a year, and the policy has a 10% cap, the cash value would be credited 10%. If the index loses 10%, the cash value would be credited the floor rate (0% or 1%).</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ideal-clients">
              <AccordionTrigger className="px-4">Ideal Clients for IUL</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Clients seeking higher potential returns than traditional whole life</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Individuals who want market exposure without direct market risk</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Business owners for executive benefits or key person coverage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Individuals looking for supplemental retirement income potential</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Sales Tips</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on the upside potential with downside protection</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Explain the tax advantages for retirement income planning</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Compare historical performance to traditional fixed interest options</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Highlight the flexibility of premium payments and death benefits</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important compliance note</AlertTitle>
            <AlertDescription>
              When illustrating IUL policies, always ensure you're following the most current illustration guidelines. Never show 
              only maximum illustrated rates, and make sure clients understand that actual returns may be lower than illustrated. 
              The market index crediting is significantly different from directly investing in the market.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What determines the interest crediting in an IUL policy?",
          options: [
            "Direct investment in stocks",
            "Performance of a market index (like S&P 500)",
            "Federal interest rates",
            "Insurance company profits"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a 'cap rate' in an IUL policy?",
          options: [
            "The minimum interest rate guaranteed",
            "The fee charged for policy administration",
            "The maximum interest rate that can be credited regardless of index performance",
            "The percentage of premiums allocated to the death benefit"
          ],
          correctAnswer: 2
        },
        {
          question: "What happens to the cash value in an IUL if the linked market index experiences a 15% loss?",
          options: [
            "The cash value decreases by 15%",
            "The cash value decreases by a smaller percentage based on the participation rate",
            "The cash value remains the same (0% floor) or receives the minimum guaranteed rate",
            "The insurance company adds funds to offset the loss"
          ],
          correctAnswer: 2
        },
        {
          question: "Which of the following is typically a benefit of an IUL over a traditional whole life policy?",
          options: [
            "Guaranteed cash value accumulation",
            "Lower premium requirements",
            "Potential for higher returns based on market performance",
            "More certain dividend payments"
          ],
          correctAnswer: 2
        },
        {
          question: "What is a 'participation rate' in an IUL policy?",
          options: [
            "The percentage of the premium that goes toward the death benefit",
            "The percentage of the index gain that is credited to the policy",
            "The percentage of policyholders who receive dividends",
            "The percentage of cash value available for loans"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "vul",
      title: "Variable Universal Life (VUL)",
      description: "Learn about VUL products, sub-account investments, and high-net-worth client strategies.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">What is Variable Universal Life Insurance (VUL)?</h3>
            <p className="mt-2 text-muted-foreground">
              Variable Universal Life insurance combines death benefit protection with investment opportunities through 
              sub-accounts similar to mutual funds. It offers the most investment flexibility among life insurance products, 
              with the potential for higher returns but also the highest risk exposure.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Investment Sub-accounts:</span> Cash value can be allocated among various investment options.</li>
              <li><span className="font-medium">Market Exposure:</span> Direct exposure to market performance with no caps on returns.</li>
              <li><span className="font-medium">Risk:</span> Possibility of cash value loss if investments perform poorly.</li>
              <li><span className="font-medium">Flexible Premiums:</span> Ability to adjust premium payments within limits.</li>
              <li><span className="font-medium">Adjustable Death Benefit:</span> Option to increase or decrease coverage as needs change.</li>
              <li><span className="font-medium">Tax-Advantaged Growth:</span> Investments grow tax-deferred with tax-free access through loans.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="investment-options">
              <AccordionTrigger className="px-4">Investment Options & Sub-accounts</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">VUL policies typically offer a range of investment options:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Stock Funds:</strong> Domestic and international equity options of various market caps</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Bond Funds:</strong> Government, corporate, and international fixed income options</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Balanced Funds:</strong> Combinations of stocks and bonds for moderate risk profiles</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Money Market:</strong> Lower-risk options for capital preservation</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Asset Allocation Portfolios:</strong> Professionally managed portfolios with different risk levels</span>
                  </li>
                </ul>
                <p className="mt-3">Policyholders can typically allocate their cash value among multiple sub-accounts and change allocations over time as their risk tolerance or market conditions change.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ideal-clients">
              <AccordionTrigger className="px-4">Ideal Clients for VUL</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>High-net-worth individuals with sophisticated investment knowledge</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Clients with higher risk tolerance seeking maximum upside potential</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Individuals looking for additional tax-advantaged investment vehicles</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Business owners for executive compensation packages</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Sales Tips</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on the investment flexibility and control</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Emphasize the unlimited upside potential (with appropriate risk disclosures)</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Highlight tax advantages for high-income clients who have maxed out other tax-advantaged accounts</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Compare with direct market investments to show the additional death benefit protection</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical compliance warning</AlertTitle>
            <AlertDescription>
              VUL policies involve securities and require proper licensing (life insurance license plus securities license). 
              Full prospectus delivery and suitability requirements must be strictly followed. Never downplay the investment 
              risks involved with VUL policies. Make sure clients fully understand that poor investment performance can lead 
              to policy lapse if cash value becomes insufficient to cover policy charges.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What distinguishes Variable Universal Life from other permanent life insurance types?",
          options: [
            "It offers the lowest premiums",
            "It provides cash value investment options through sub-accounts",
            "It guarantees a minimum rate of return",
            "It automatically adjusts the death benefit based on inflation"
          ],
          correctAnswer: 1
        },
        {
          question: "What additional license(s) do agents typically need to sell VUL products?",
          options: [
            "No additional licenses beyond a life insurance license",
            "Health insurance license",
            "Property and casualty license",
            "Securities license (such as Series 6 or 7)"
          ],
          correctAnswer: 3
        },
        {
          question: "What happens to the cash value in a VUL if the selected investment sub-accounts perform poorly?",
          options: [
            "The insurance company guarantees a minimum return",
            "The cash value can decrease in value",
            "The policy automatically transfers funds to more conservative investments",
            "The death benefit decreases to maintain the cash value"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of the following clients would typically be the MOST suitable for a VUL policy?",
          options: [
            "A conservative retiree seeking guaranteed income",
            "A middle-income family looking for maximum coverage at lowest cost",
            "A high-income professional with investment experience who has maxed out 401(k) contributions",
            "A young adult purchasing their first life insurance policy"
          ],
          correctAnswer: 2
        },
        {
          question: "What document must be provided to all VUL purchasers?",
          options: [
            "Annual report",
            "Prospectus",
            "Policy illustration",
            "Tax certificate"
          ],
          correctAnswer: 1
        }
      ]
    }
  ];
  
  const currentModule = trainingModules.find(m => m.id === selectedModule) || trainingModules[0];
  
  // Calculate quiz score
  const calculateScore = () => {
    let correct = 0;
    currentModule.quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      score: correct,
      total: currentModule.quiz.length,
      percentage: Math.round((correct / currentModule.quiz.length) * 100)
    };
  };
  
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setUserAnswers({
      ...userAnswers,
      [questionIndex]: answerIndex
    });
  };
  
  const handleNextQuestion = () => {
    if (currentQuestion < currentModule.quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setUserAnswers({});
    setShowResults(false);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Training</h1>
          <p className="text-muted-foreground">
            Master life insurance products to better serve your clients
          </p>
        </div>
        
        {!quizMode && (
          <Button 
            onClick={() => {
              setQuizMode(true);
              resetQuiz();
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Take Quiz
          </Button>
        )}
        
        {quizMode && !showResults && (
          <Button 
            variant="outline"
            onClick={() => {
              setQuizMode(false);
              resetQuiz();
            }}
          >
            Back to Training
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Insurance Products</CardTitle>
              <CardDescription>Select a product to learn about</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {trainingModules.map((module) => (
                  <Button
                    key={module.id}
                    variant={selectedModule === module.id ? "default" : "ghost"}
                    className="w-full justify-start rounded-none h-auto py-3 px-4"
                    onClick={() => {
                      setSelectedModule(module.id);
                      setQuizMode(false);
                      resetQuiz();
                    }}
                  >
                    <div className="flex items-center">
                      {selectedModule === module.id ? (
                        <BookOpen className="mr-2 h-4 w-4" />
                      ) : (
                        <BookOpen className="mr-2 h-4 w-4 opacity-50" />
                      )}
                      <span>{module.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Learning Path</CardTitle>
              <CardDescription>Your progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingModules.map((module) => {
                  // This would normally come from a user's progress data
                  const progress = Math.floor(Math.random() * 101);
                  return (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{module.title}</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start">
              <p className="text-sm text-muted-foreground">Complete all modules to earn your certification</p>
              <Button variant="outline" className="mt-3 w-full">
                <Award className="mr-2 h-4 w-4" />
                View Certificates
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{currentModule.title}</CardTitle>
              <CardDescription>{currentModule.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {!quizMode && currentModule.content}
              
              {quizMode && !showResults && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Question {currentQuestion + 1} of {currentModule.quiz.length}</h3>
                    <div className="text-sm text-muted-foreground">
                      {Object.keys(userAnswers).length} of {currentModule.quiz.length} answered
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg mb-6">
                    <p className="font-medium mb-4">{currentModule.quiz[currentQuestion].question}</p>
                    <div className="space-y-3">
                      {currentModule.quiz[currentQuestion].options.map((option, index) => (
                        <div
                          key={index}
                          className={`
                            p-3 rounded-md border cursor-pointer transition-colors
                            ${userAnswers[currentQuestion] === index 
                              ? 'bg-primary/10 border-primary' 
                              : 'hover:bg-muted'
                            }
                          `}
                          onClick={() => handleAnswerSelect(currentQuestion, index)}
                        >
                          <div className="flex items-start">
                            <div className={`
                              h-5 w-5 rounded-full border flex items-center justify-center mr-3 flex-shrink-0 mt-0.5
                              ${userAnswers[currentQuestion] === index ? 'border-primary bg-primary text-primary-foreground' : ''}
                            `}>
                              {userAnswers[currentQuestion] === index && <Check className="h-3 w-3" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (currentQuestion > 0) {
                          setCurrentQuestion(currentQuestion - 1);
                        }
                      }}
                      disabled={currentQuestion === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextQuestion}
                      disabled={userAnswers[currentQuestion] === undefined}
                    >
                      {currentQuestion < currentModule.quiz.length - 1 ? 'Next Question' : 'See Results'}
                    </Button>
                  </div>
                </div>
              )}
              
              {quizMode && showResults && (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center rounded-full bg-green-100 p-6 mb-4">
                      <Award className="h-10 w-10 text-green-600" />
                    </div>
                    
                    <h3 className="text-2xl font-bold">Quiz Results</h3>
                    
                    <div className="mt-6 mb-8">
                      <div className="text-5xl font-bold mb-2">{calculateScore().percentage}%</div>
                      <p className="text-muted-foreground">
                        You answered {calculateScore().score} out of {calculateScore().total} questions correctly
                      </p>
                    </div>
                    
                    {calculateScore().percentage >= 80 ? (
                      <Alert className="bg-green-50 border-green-200 text-green-800 max-w-md mx-auto mb-6">
                        <BadgeCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle>Congratulations!</AlertTitle>
                        <AlertDescription>
                          You've successfully completed this module. Great job!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-amber-50 border-amber-200 text-amber-800 max-w-md mx-auto mb-6">
                        <HelpCircle className="h-4 w-4 text-amber-600" />
                        <AlertTitle>Keep learning</AlertTitle>
                        <AlertDescription>
                          Review the material and try again to improve your score.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex justify-center space-x-4 mt-8">
                      <Button 
                        variant="outline"
                        onClick={() => setQuizMode(false)}
                      >
                        Back to Training
                      </Button>
                      
                      <Button 
                        onClick={resetQuiz}
                      >
                        Retake Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}