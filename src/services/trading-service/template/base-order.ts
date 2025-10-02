import { config } from "@/config/config";
import { TransactionType } from "@/enums/transaction-type";
import { Asset } from "@/models/asset";
import { Portfolio } from "@/models/portfolio";
import { Transaction } from "@/models/transaction";
import { User } from "@/models/user";
import {
  AssetStorage,
  MarketDataStorage,
  PortafolioStorage,
  TransactionStorage,
  UserStorage,
} from "@/utils/facade/storage";
import { IExecutable } from "../factory/orders-factory";

export abstract class BaseOrder implements IExecutable {
  execute(
    userId: string,
    symbol: string,
    type: TransactionType,
    quantity: number
  ): Transaction {
    const user = this.getUser(userId);
    const asset = this.getAsset(symbol);
    const executionPrice = this.getExecutionPrice(asset);

    const { fees, totalCostOrNetAmount } = this.prepareTransactionDetails(
      quantity,
      executionPrice,
      user,
      symbol
    );

    const transaction = this.createTransaction(
      userId,
      type,
      symbol,
      quantity,
      executionPrice,
      fees
    );

    this.completeTransaction(transaction);
    this.updateUserBalance(type, user, totalCostOrNetAmount);
    this.updatePortfolio(type, userId, symbol, quantity, executionPrice);
    this.saveTransaction(transaction);
    this.simulateMarket(symbol, quantity, type);

    return transaction;
  }

  private getUser(userId: string): User {
    const user = UserStorage.getById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    return user;
  }

  private getAsset(symbol: string): Asset {
    const asset = AssetStorage.getBySymbol(symbol);
    if (!asset) {
      throw new Error("Activo no encontrado");
    }
    return asset;
  }

  private getExecutionPrice(asset: Asset) {
    return asset.currentPrice;
  }

  private createTransaction(
    userId: string,
    type: TransactionType,
    symbol: string,
    quantity: number,
    executionPrice: number,
    fees: number
  ): Transaction {
    const transactionId = this.generateTransactionId();
    const transaction = new Transaction(
      transactionId,
      userId,
      type,
      symbol,
      quantity,
      executionPrice,
      fees
    );
    return transaction;
  }

  private completeTransaction(transaction: Transaction): void {
    transaction.complete();
  }

  private updateUserBalance(
    type: TransactionType,
    user: User,
    totalCostOrNetAmount: number
  ): void {
    if (type === TransactionType.BUY) {
      user.deductBalance(totalCostOrNetAmount);
      UserStorage.update(user);
    } else {
      user.addBalance(totalCostOrNetAmount);
      UserStorage.update(user);
    }
  }

  private updatePortfolio(
    type: TransactionType,
    userId: string,
    symbol: string,
    quantity: number,
    executionPrice: number
  ): void {
    if (type === TransactionType.BUY) {
      this.updatePortfolioAfterBuy(userId, symbol, quantity, executionPrice);
    } else {
      this.updatePortfolioAfterSell(userId, symbol, quantity, executionPrice);
    }
  }

  private saveTransaction(transaction: Transaction): void {
    TransactionStorage.add(transaction);
  }

  private simulateMarket(
    symbol: string,
    quantity: number,
    type: TransactionType
  ): void {
    this.simulateMarketImpact(symbol, quantity, type);
  }

  // Método que debe implementar cada subclase para hacer validaciones y calcular costos dependiendo de que tipo de orden sea
  protected abstract prepareTransactionDetails(
    quantity: number,
    executionPrice: number,
    user: User,
    symbol: string
  ): {
    fees: number;
    totalCostOrNetAmount: number;
  };

  // Simulación de impacto en el mercado después de una operación
  private simulateMarketImpact(
    symbol: string,
    quantity: number,
    action: TransactionType
  ): void {
    const marketData = MarketDataStorage.getBySymbol(symbol);
    if (!marketData) return;

    // Calcular impacto basado en volumen
    const impactFactor = quantity / 1000000; // Factor arbitrario
    const priceImpact = marketData.price * impactFactor * 0.001;

    const newPrice =
      action === TransactionType.BUY
        ? marketData.price + priceImpact
        : marketData.price - priceImpact;

    const change = newPrice - marketData.price;
    const changePercent = (change / marketData.price) * 100;

    marketData.price = newPrice;
    marketData.change = change;
    marketData.changePercent = changePercent;
    marketData.timestamp = new Date();

    // Actualizar asset también
    const asset = AssetStorage.getBySymbol(symbol);
    if (asset) {
      asset.currentPrice = newPrice;
      asset.lastUpdated = new Date();
      AssetStorage.update(asset);
    }

    MarketDataStorage.update(marketData);
  }

  // Generar ID único para transacciones
  private generateTransactionId(): string {
    return "txn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  // Actualizar portafolio después de compra
  private updatePortfolioAfterBuy(
    userId: string,
    symbol: string,
    quantity: number,
    price: number
  ): void {
    const portfolio = PortafolioStorage.getByUserId(userId);
    if (!portfolio) return;

    // Agregar las acciones al portafolio
    portfolio.addHolding(symbol, quantity, price);

    // Recalcular valores actuales
    this.recalculatePortfolioValues(portfolio);

    PortafolioStorage.update(portfolio);
  }

  // Actualizar portafolio después de venta
  private updatePortfolioAfterSell(
    userId: string,
    symbol: string,
    quantity: number,
    price: number
  ): void {
    const portfolio = PortafolioStorage.getByUserId(userId);
    if (!portfolio) return;

    // Remover las acciones del portafolio
    portfolio.removeHolding(symbol, quantity);

    // Recalcular valores actuales
    this.recalculatePortfolioValues(portfolio);

    PortafolioStorage.update(portfolio);
  }

  // Recalcular valores del portafolio
  private recalculatePortfolioValues(portfolio: Portfolio): void {
    // Actualizar el valor actual de cada holding
    portfolio.holdings.forEach((holding) => {
      const asset = AssetStorage.getBySymbol(holding.symbol);
      if (asset) {
        holding.updateCurrentValue(asset.currentPrice);
      }
    });

    // Calcular totales del portafolio
    portfolio.calculateTotals();
  }

  // Cálculo de comisiones
  protected calculateFees(amount: number, type: TransactionType): number {
    const feePercentage =
      type === "buy"
        ? config.tradingFees.buyFeePercentage
        : config.tradingFees.sellFeePercentage;
    const calculatedFee = amount * feePercentage;
    return Math.max(calculatedFee, config.tradingFees.minimumFee);
  }
}
