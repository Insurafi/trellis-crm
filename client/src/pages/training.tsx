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
    },
    {
      id: "mortgage",
      title: "Mortgage Protection",
      description: "Learn how to position mortgage protection insurance to protect families' homes and financial security.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">What is Mortgage Protection Insurance?</h3>
            <p className="mt-2 text-muted-foreground">
              Mortgage Protection Insurance is a specialized form of term life insurance designed to pay off a mortgage 
              balance in the event of the policyholder's death. It provides financial peace of mind that a family's home 
              will be protected if the primary earner or mortgage holder passes away.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Mortgage-Specific:</span> Designed specifically to cover mortgage debt.</li>
              <li><span className="font-medium">Decreasing Benefit:</span> Many policies feature a death benefit that decreases alongside the mortgage balance.</li>
              <li><span className="font-medium">Simplified Underwriting:</span> Often easier to qualify for than traditional life insurance.</li>
              <li><span className="font-medium">Direct Payment:</span> Some policies pay benefits directly to the mortgage lender.</li>
              <li><span className="font-medium">Living Benefits:</span> Many policies now include critical illness or disability riders.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="ideal-clients">
              <AccordionTrigger className="px-4">Ideal Clients for Mortgage Protection</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>New homeowners with significant mortgage balances</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Families with children where one income is essential for the mortgage payment</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Self-employed individuals with fluctuating income</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Clients with health conditions that might make traditional insurance more expensive</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="comparison">
              <AccordionTrigger className="px-4">Comparison with Traditional Term Life</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Mortgage Protection Insurance:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Designed specifically for mortgage payoff</li>
                      <li>Often has simplified underwriting</li>
                      <li>Benefit typically decreases over time</li>
                      <li>May have limited flexibility in beneficiary designation</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Traditional Term Life Insurance:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Flexible death benefit can be used for any purpose</li>
                      <li>Usually requires more comprehensive underwriting</li>
                      <li>Level death benefit throughout the term</li>
                      <li>Complete flexibility in beneficiary designation</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Sales Tips</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on the peace of mind that the family home will be protected</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Use personal stories about families who have benefited from mortgage protection</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Highlight any living benefits or riders that provide additional value</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Explain how it fits into a comprehensive financial protection strategy</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important to remember</AlertTitle>
            <AlertDescription>
              When presenting mortgage protection, always conduct a needs analysis to determine if a client would be 
              better served by traditional term life insurance. Sometimes a level term policy with a higher death benefit 
              offers better value and more flexibility than a dedicated mortgage protection policy.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What is the primary purpose of mortgage protection insurance?",
          options: [
            "To provide income replacement for the family",
            "To pay off a mortgage balance if the policyholder dies",
            "To cover home repair expenses",
            "To protect against foreclosure due to job loss"
          ],
          correctAnswer: 1
        },
        {
          question: "How does the death benefit of most mortgage protection policies change over time?",
          options: [
            "It typically increases with inflation",
            "It remains level throughout the policy term",
            "It typically decreases alongside the mortgage balance",
            "It fluctuates based on housing market values"
          ],
          correctAnswer: 2
        },
        {
          question: "Which of the following is typically a feature of mortgage protection insurance?",
          options: [
            "Cash value accumulation",
            "Fixed premiums for the entire mortgage term",
            "Simplified underwriting compared to traditional term insurance",
            "Higher premiums than comparable term insurance"
          ],
          correctAnswer: 2
        },
        {
          question: "Which client would generally be MOST suited for mortgage protection insurance?",
          options: [
            "A retiree who has paid off their mortgage",
            "A young family that just purchased their first home",
            "A business owner seeking key person insurance",
            "A renter looking for life insurance"
          ],
          correctAnswer: 1
        },
        {
          question: "What is an advantage of traditional term life insurance over mortgage protection?",
          options: [
            "It's always less expensive",
            "It provides more flexibility in how the death benefit can be used",
            "It always has better living benefits",
            "It's easier to qualify for"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "seniors",
      title: "Life Insurance for Seniors",
      description: "Master the strategies for providing insurance solutions to seniors and addressing their unique needs.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Senior Life Insurance Solutions</h3>
            <p className="mt-2 text-muted-foreground">
              Seniors have unique life insurance needs that differ from younger clients. Their concerns typically center around 
              final expenses, legacy planning, debt clearance, and providing for a surviving spouse. Understanding these specialized 
              needs is crucial for effectively serving this growing demographic.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Common Senior Insurance Products
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Guaranteed Issue Life:</span> No medical questions, higher premiums, graded death benefit.</li>
              <li><span className="font-medium">Simplified Issue Life:</span> Limited health questions, quicker approval, moderate premiums.</li>
              <li><span className="font-medium">Final Expense:</span> Small whole life policies designed to cover burial and end-of-life costs.</li>
              <li><span className="font-medium">Single Premium Life:</span> One-time payment for permanent coverage, often used in estate planning.</li>
              <li><span className="font-medium">Modified Term:</span> Term policies with age-adjusted features for seniors up to certain ages.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="needs-assessment">
              <AccordionTrigger className="px-4">Senior-Specific Needs Assessment</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">When working with seniors, assess these key areas:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Final expenses:</strong> Burial costs, medical bills, and other end-of-life expenses</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Income replacement:</strong> For still-working seniors or those with dependent spouses</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Estate planning:</strong> Inheritance equalization, charitable giving, and tax strategies</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Debt clearance:</strong> Outstanding mortgages, medical debt, or other liabilities</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Long-term care concerns:</strong> Many policies now offer LTC riders or accelerated benefits</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="underwriting">
              <AccordionTrigger className="px-4">Navigating Underwriting Challenges</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">Senior clients often face underwriting challenges. Here's how to navigate them:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Know which carriers specialize in senior health conditions like controlled diabetes or heart history</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Consider guaranteed issue options for clients with significant health issues</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Prepare clients thoroughly for medical exams if required</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Gather detailed health information before applying to match with the right carrier</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-tips">
              <AccordionTrigger className="px-4">Senior Sales Approach</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on creating a legacy rather than income replacement</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Emphasize the peace of mind of not burdening family with final expenses</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Present clear, simple information—avoid complex diagrams or technical jargon</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Involve adult children in the conversation when appropriate</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Be patient and respectful—seniors appreciate thorough explanations and unhurried meetings</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ethical considerations</AlertTitle>
            <AlertDescription>
              When selling to seniors, ethical practices are paramount. Always ensure products are suitable and affordable, 
              avoid high-pressure tactics, and be aware of cognitive impairment signs that might affect decision-making. 
              Document thoroughly and consider involving family members when appropriate.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "Which of the following is typically the PRIMARY concern for senior life insurance clients?",
          options: [
            "Income replacement for decades of future earnings",
            "Covering final expenses and funeral costs",
            "Funding children's college education",
            "Protecting a business from financial loss"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a key feature of Guaranteed Issue life insurance?",
          options: [
            "Lower premiums than other senior policies",
            "No medical questions or exams required",
            "Higher face amounts than other policies",
            "Immediate full death benefit from day one"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of the following is an important ethical consideration when selling to seniors?",
          options: [
            "Always involve their adult children in the sale",
            "Recommend the highest commission product available",
            "Be aware of signs of cognitive impairment",
            "Focus on speed to close the sale quickly"
          ],
          correctAnswer: 2
        },
        {
          question: "What type of life insurance product often works well for estate planning for seniors?",
          options: [
            "Term life insurance",
            "Single premium life insurance",
            "Annual renewable term",
            "Group life insurance"
          ],
          correctAnswer: 1
        },
        {
          question: "When discussing policy features with senior clients, what approach is generally best?",
          options: [
            "Use technical insurance terminology to demonstrate expertise",
            "Present complex illustrations showing all possible scenarios",
            "Communicate clearly with simple, straightforward explanations",
            "Focus primarily on potential investment returns"
          ],
          correctAnswer: 2
        }
      ]
    },
    {
      id: "parents",
      title: "Life Insurance for Parents",
      description: "Learn strategies for protecting families with children and addressing parents' unique coverage needs.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Life Insurance Solutions for Parents</h3>
            <p className="mt-2 text-muted-foreground">
              Parents face unique financial responsibilities that make proper life insurance coverage essential. 
              From income replacement to education funding to childcare expenses, parents need specialized insurance 
              planning that protects their children's future regardless of what happens.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Protection Needs for Parents
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Income Replacement:</span> Providing financial support to replace lost income.</li>
              <li><span className="font-medium">Debt Coverage:</span> Paying off mortgages, auto loans, and other family debt.</li>
              <li><span className="font-medium">Education Funding:</span> Ensuring children's education plans remain intact.</li>
              <li><span className="font-medium">Childcare Costs:</span> Covering potential increased childcare expenses for the surviving parent.</li>
              <li><span className="font-medium">Stay-at-Home Value:</span> Replacing the economic value of a stay-at-home parent's contributions.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="coverage-amount">
              <AccordionTrigger className="px-4">Determining Coverage Amounts</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">When calculating needed coverage for parents, consider:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Income multiplier:</strong> 10-15x annual income as a starting point</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>DIME method:</strong> Debt + Income + Mortgage + Education costs</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Human Life Value:</strong> Present value of all future income</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Stay-at-home value:</strong> Cost to replace services (childcare, household management, etc.)</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="stay-at-home">
              <AccordionTrigger className="px-4">Insuring Stay-at-Home Parents</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">Many families overlook the financial impact of losing a stay-at-home parent:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>The economic value often exceeds $170,000 annually when all services are considered</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Cover childcare, household management, transportation, education support, and more</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Recommend coverage of at least $300,000-$500,000 for most stay-at-home parents</span>
                  </li>
                  <li className="flex items-start">
                    <Info className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Consider future income potential if they plan to return to the workforce</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="product-solutions">
              <AccordionTrigger className="px-4">Recommended Product Solutions</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Term Life:</strong> High coverage at affordable rates during child-raising years</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Convertible Term:</strong> Flexibility to convert to permanent coverage later</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Permanent Insurance:</strong> For long-term needs and legacy goals</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Parent/Child Riders:</strong> Cost-effective coverage for children</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Policy Laddering:</strong> Multiple term policies with different end dates to match decreasing needs</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Additional protection considerations</AlertTitle>
            <AlertDescription>
              Don't overlook disability insurance and living benefits riders when creating a comprehensive 
              protection plan for parents. These provide critical protection against illness or disability, 
              which statistically are more likely to occur than premature death during working years.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "When calculating life insurance needs for parents, what does the DIME method stand for?",
          options: [
            "Duration, Investment, Mortgage, Education",
            "Debt, Income, Mortgage, Education",
            "Dependents, Income, Money, Estate",
            "Debt, Insurance, Minimum Expenses"
          ],
          correctAnswer: 1
        },
        {
          question: "What is typically the recommended coverage amount starting point for an income-earning parent?",
          options: [
            "1-3 times annual income",
            "5-7 times annual income",
            "10-15 times annual income",
            "20-25 times annual income"
          ],
          correctAnswer: 2
        },
        {
          question: "Why should stay-at-home parents have life insurance coverage?",
          options: [
            "It's required by law for all parents",
            "To replace the economic value of services they provide",
            "Only if they plan to return to work eventually",
            "It's unnecessary if the working parent has coverage"
          ],
          correctAnswer: 1
        },
        {
          question: "What type of life insurance typically provides the highest coverage amount at the lowest cost for young parents?",
          options: [
            "Whole life insurance",
            "Variable universal life",
            "Term life insurance",
            "Single premium life"
          ],
          correctAnswer: 2
        },
        {
          question: "What is 'policy laddering' in the context of life insurance for parents?",
          options: [
            "Gradually increasing coverage as children are born",
            "Having multiple policies with different end dates to match decreasing needs",
            "Adding additional insureds to a single policy",
            "Stacking multiple policy riders for comprehensive coverage"
          ],
          correctAnswer: 1
        }
      ]
    },
    {
      id: "final",
      title: "Final Expense Insurance",
      description: "Master the specialized market of final expense coverage, including sales approaches and product options.",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Final Expense Insurance Fundamentals</h3>
            <p className="mt-2 text-muted-foreground">
              Final expense insurance is a specialized whole life product designed to cover end-of-life costs, 
              including funeral expenses, medical bills, and other debts. These policies typically feature smaller 
              face amounts, simplified underwriting, and level premiums that never increase.
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium flex items-center">
              <Info className="h-4 w-4 mr-2 text-blue-500" />
              Key Product Features
            </h4>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Face Amounts:</span> Typically $5,000 to $50,000.</li>
              <li><span className="font-medium">Cash Value:</span> Accumulates modest cash value.</li>
              <li><span className="font-medium">Simplified Issue:</span> Limited health questions, no medical exam.</li>
              <li><span className="font-medium">Guaranteed Issue:</span> Acceptance regardless of health (with benefit limitations).</li>
              <li><span className="font-medium">Age Range:</span> Usually available to seniors ages 50-85.</li>
              <li><span className="font-medium">Stable Premiums:</span> Fixed for the life of the policy.</li>
            </ul>
          </div>
          
          <Accordion type="single" collapsible className="border rounded-md">
            <AccordionItem value="product-types">
              <AccordionTrigger className="px-4">Types of Final Expense Policies</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Level Benefit (Preferred):</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>For those in relatively good health</li>
                      <li>Full death benefit from day one</li>
                      <li>Lower premiums than guaranteed issue</li>
                      <li>Some health questions required</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Graded Benefit:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>For those with some health issues</li>
                      <li>Partial benefit in early years (e.g., 30% year 1, 70% year 2, 100% year 3+)</li>
                      <li>Higher premiums than level benefit</li>
                      <li>Fewer health questions</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium">Guaranteed Issue:</p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>For those with significant health issues</li>
                      <li>No health questions</li>
                      <li>2-3 year waiting period (return of premium plus interest if death occurs)</li>
                      <li>Highest premiums of the three types</li>
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="market-needs">
              <AccordionTrigger className="px-4">Understanding Client Needs</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <p className="mb-3">Final expense clients are typically concerned about:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Not burdening family with funeral costs (average funeral costs $9,000-$12,000+)</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Covering final medical bills not paid by Medicare or other insurance</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Settling small debts and personal loans</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Leaving a small inheritance or donation</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Having permanent coverage that won't terminate at a certain age</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sales-approach">
              <AccordionTrigger className="px-4">Effective Sales Approach</AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Focus on peace of mind and financial responsibility, not death</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Use simple, clear language and avoid complex insurance terminology</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Be respectful, patient, and allow extra time for questions</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Emphasize the permanent nature of coverage that won't expire</span>
                  </li>
                  <li className="flex items-start">
                    <ThumbsUp className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>Highlight the fixed premium that will never increase</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Ethics in Final Expense Sales</AlertTitle>
            <AlertDescription>
              The final expense market requires the highest ethical standards. Many clients are elderly, 
              on fixed incomes, and potentially vulnerable. Always ensure the policy is affordable and 
              appropriate, never oversell coverage, and be transparent about any waiting periods or 
              benefit limitations. Document all recommendations thoroughly.
            </AlertDescription>
          </Alert>
        </div>
      ),
      quiz: [
        {
          question: "What is the typical face amount range for final expense insurance?",
          options: [
            "$1,000 to $5,000",
            "$5,000 to $50,000",
            "$50,000 to $100,000",
            "$100,000 to $250,000"
          ],
          correctAnswer: 1
        },
        {
          question: "What is a 'graded benefit' in final expense insurance?",
          options: [
            "A death benefit that increases over time",
            "A premium that decreases over time",
            "A partial death benefit in the early policy years",
            "A benefit that varies based on cause of death"
          ],
          correctAnswer: 2
        },
        {
          question: "What typically happens if someone with a guaranteed issue policy dies during the waiting period?",
          options: [
            "The full death benefit is paid regardless",
            "No benefit is paid under any circumstances",
            "The premiums paid are returned plus interest",
            "The beneficiary can continue the policy"
          ],
          correctAnswer: 2
        },
        {
          question: "What is the primary purpose of final expense insurance?",
          options: [
            "Income replacement for surviving family members",
            "Coverage for burial costs and end-of-life expenses",
            "Mortgage protection",
            "Building cash value as an investment"
          ],
          correctAnswer: 1
        },
        {
          question: "Which of the following is an ethical consideration when selling final expense insurance?",
          options: [
            "Always recommend the highest available face amount",
            "Only show the client one carrier's offerings",
            "Ensure the policy is affordable on the client's fixed income",
            "Emphasize that the policy builds significant investment value"
          ],
          correctAnswer: 2
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