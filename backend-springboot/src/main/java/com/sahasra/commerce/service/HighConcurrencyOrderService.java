package com.sahasra.commerce.service;

import com.sahasra.commerce.domain.ProductEntity;
import com.stripe.model.PaymentIntent;
import com.stripe.net.RequestOptions;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.persistence.OptimisticLockException;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
public class HighConcurrencyOrderService {

    private final RedissonClient redissonClient;

    public HighConcurrencyOrderService(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    /**
     * Reserves inventory under high concurrency using Redis fine-grained SKU lock
     * combined with JPA @Version optimistic locking and Stripe idempotency keys.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public PaymentIntent reserveAndCreateStripeIntent(
            ProductEntity product,
            int quantity,
            String idempotencyKey,
            String customerEmail
    ) throws Exception {
        String lockKey = "lock:inventory:sku:" + product.getSku();
        RLock skuLock = redissonClient.getFairLock(lockKey);

        boolean acquired = skuLock.tryLock(2, 5, TimeUnit.SECONDS);
        if (!acquired) {
            throw new OptimisticLockException("High concurrency contention on SKU " + product.getSku());
        }

        try {
            product.reserveStock(quantity);

            long amountInPaise = product.getSalePriceInr()
                    .multiply(BigDecimal.valueOf(quantity))
                    .multiply(BigDecimal.valueOf(100))
                    .longValueExact();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInPaise)
                    .setCurrency("inr")
                    .setReceiptEmail(customerEmail)
                    .putMetadata("sku", product.getSku())
                    .putMetadata("quantity", String.valueOf(quantity))
                    .putMetadata("entityVersion", String.valueOf(product.getVersion()))
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    )
                    .build();

            RequestOptions requestOptions = RequestOptions.builder()
                    .setIdempotencyKey(idempotencyKey)
                    .build();

            return PaymentIntent.create(params, requestOptions);
        } finally {
            if (skuLock.isHeldByCurrentThread()) {
                skuLock.unlock();
            }
        }
    }
}
