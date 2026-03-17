import { OrderStatus } from '../store/orderSlice';
import { CheckCircle2, Circle, Truck, Package, Clock, ShieldCheck, Undo2 } from 'lucide-react';

export default function OrderTrackingStepper({ status, orderType }: { status: OrderStatus, orderType: 'digital' | 'physical' }) {
    const digitalSteps: { label: OrderStatus; icon: React.ElementType }[] = [
        { label: 'Payment Pending', icon: Clock },
        { label: 'Payment Done', icon: CheckCircle2 },
        { label: 'Confirmed', icon: ShieldCheck }
    ];

    const physicalSteps: { label: OrderStatus; icon: React.ElementType }[] = [
        { label: 'Ordered', icon: Clock },
        { label: 'Shipped', icon: Package },
        { label: 'Out for Delivery', icon: Truck },
        { label: 'Delivered', icon: CheckCircle2 },
        { label: 'Return Picked', icon: Undo2 },
        { label: 'Return Completed', icon: CheckCircle2 }
    ];

    const steps = orderType === 'digital' ? digitalSteps : physicalSteps;
    const currentStepIndex = steps.findIndex(s => s.label === status);

    // Fallback if status doesn't exactly match the pipeline, just max it out or keep it at 0
    const clampedIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className="w-full py-6 overflow-x-auto">
            <div className="flex items-center justify-between relative min-w-[300px]">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
                <div
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-500 z-0 transition-all duration-500 rounded-full"
                    style={{ width: `${(clampedIndex / (Math.max(1, steps.length - 1))) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= clampedIndex;
                    const isCurrent = index === clampedIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.label} className="relative z-10 flex flex-col items-center flex-1">
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-4 bg-white transition-colors duration-300
                  ${isCompleted ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-400'}
                  ${isCurrent ? 'ring-4 ring-green-100' : ''}
                `}
                            >
                                {isCompleted ? <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> : <Circle className="w-3 h-3 sm:w-4 sm:h-4" />}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-semibold mt-3 text-center ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
