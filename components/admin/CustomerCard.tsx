import { CustomerInfo } from "@/types/customer";
import React from "react";

export function CustomerCard({ customer }: { customer: CustomerInfo }) {
    return (
        <div className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <h4 className="font-medium">{customer.name}</h4>
                    <p className="text-sm text-gray-600">📱 {customer.mobile}</p>
                    {customer.createdAt && (
                        <p className="text-xs text-gray-500">
                            Joined: {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div>
                    <p className="text-sm">📍 {customer.place}</p>
                    {customer.landmark && <p className="text-sm text-gray-600">🏛️ {customer.landmark}</p>}
                    {customer.lastOrderAt && (
                        <p className="text-xs text-gray-500">
                            Last order: {new Date(customer.lastOrderAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end space-x-4">
                        <div className="text-center">
                            <p className="text-sm font-medium text-yellow-600">⭐ {customer.loyaltyPoints}</p>
                            <p className="text-xs text-gray-500">Points</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-green-600">📦 {customer.orderCount}</p>
                            <p className="text-xs text-gray-500">Orders</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
