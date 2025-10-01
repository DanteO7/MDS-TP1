import { Request, Response } from "express";
import { TradingService } from "../services/trading-service/TradingService";
import { AssetStorage } from "../utils/facade/storage";

const tradingService = new TradingService();

export class TradingController {
  private static validate(
    symbol: string,
    quantity: number,
    res: Response
  ): Response | void {
    // Validaciones adicionales
    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({
        error: "Símbolo requerido",
        message: "El símbolo del activo es requerido",
      });
    }

    if (!quantity || typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        error: "Cantidad inválida",
        message: "La cantidad debe ser un número mayor a 0",
      });
    }

    // Verificar que el activo existe
    const asset = AssetStorage.getBySymbol(symbol.toUpperCase());
    if (!asset) {
      return res.status(404).json({
        error: "Activo no encontrado",
        message: `El activo ${symbol} no existe`,
      });
    }
  }
  static async buyAsset(req: Request, res: Response) {
    try {
      const user = req.user;
      const { symbol, quantity } = req.body;

      TradingController.validate(symbol, quantity, res);

      // Ejecutar orden de compra
      const transaction = await tradingService.executeBuyOrder(
        user.id,
        symbol.toUpperCase(),
        quantity
      );

      res.status(201).json({
        message: "Orden de compra ejecutada exitosamente",
        transaction: {
          id: transaction.id,
          type: transaction.type,
          symbol: transaction.symbol,
          quantity: transaction.quantity,
          price: transaction.price,
          fees: transaction.fees,
          timestamp: transaction.timestamp,
          status: transaction.status,
        },
      });
    } catch (error) {
      res.status(400).json({
        error: "Error en orden de compra",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  static async sellAsset(req: Request, res: Response) {
    try {
      const user = req.user;
      const { symbol, quantity } = req.body;

      TradingController.validate(symbol, quantity, res);

      // Ejecutar orden de venta
      const transaction = await tradingService.executeSellOrder(
        user.id,
        symbol.toUpperCase(),
        quantity
      );

      res.status(201).json({
        message: "Orden de venta ejecutada exitosamente",
        transaction: {
          id: transaction.id,
          type: transaction.type,
          symbol: transaction.symbol,
          quantity: transaction.quantity,
          price: transaction.price,
          fees: transaction.fees,
          timestamp: transaction.timestamp,
          status: transaction.status,
        },
      });
    } catch (error) {
      res.status(400).json({
        error: "Error en orden de venta",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  static async getTransactionHistory(req: Request, res: Response) {
    try {
      const user = req.user;
      const transactions = tradingService.getTransactionHistory(user.id);

      res.json({
        transactions: transactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          symbol: transaction.symbol,
          quantity: transaction.quantity,
          price: transaction.price,
          fees: transaction.fees,
          timestamp: transaction.timestamp,
          status: transaction.status,
        })),
      });
    } catch (error) {
      res.status(500).json({
        error: "Error al obtener historial",
        message: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }
}
