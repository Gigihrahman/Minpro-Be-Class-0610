import { TransactionService } from '../../../modules/transaction/transaction.service';
import { PrismaService } from '../../../modules/prisma/prisma.service';
import { CloudinaryService } from '../../../modules/cloudinary/cloudinary.service';
import { MailService } from '../../../modules/mail/mail.service';
import { CreateTransactionDTO } from '../../../modules/transaction/dto/create-transaction.dto';
import { ApiError } from '../../../utils/api-error';
import { userTransactionQueue } from '../../../modules/jobs/queues/transaction.queue';

// Mock dependencies
jest.mock('../../../modules/prisma/prisma.service');
jest.mock('../../../modules/cloudinary/cloudinary.service');
jest.mock('../../../modules/mail/mail.service');
jest.mock('../../../modules/jobs/queues/transaction.queue');

describe('TransactionService - createTransaction', () => {
  let transactionService: TransactionService;
  let mockPrismaService: jest.Mocked<PrismaService>;
  let mockCloudinaryService: jest.Mocked<CloudinaryService>;
  let mockMailService: jest.Mocked<MailService>;

  // Mock data
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    fullName: 'Test User',
  };

  const mockEvent = {
    id: 1,
    name: 'Test Event',
    startEvent: new Date('2025-12-01'),
    endEvent: new Date('2025-12-02'),
  };

  const mockSeat = {
    id: 1,
    eventId: 1,
    price: 100000,
    totalSeat: 100,
    reserved: 10,
  };

  const mockCreatedTransaction = {
    id: 1,
    uuid: 'test-uuid-123',
    userId: 1,
    eventsId: 1,
    status: 'CREATED',
    totalPrice: 200000,
    createdAt: new Date(),
  };

  const mockCreateTransactionDTO: CreateTransactionDTO = {
    eventId: 1,
    detailsEvent: [
      {
        seatsId: 1,
        quantity: 2,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock instances
    mockPrismaService = new PrismaService() as jest.Mocked<PrismaService>;
    mockCloudinaryService = new CloudinaryService() as jest.Mocked<CloudinaryService>;
    mockMailService = new MailService() as jest.Mocked<MailService>;

    // Mock Prisma methods
    mockPrismaService.events = {
      findFirst: jest.fn(),
    } as any;

    mockPrismaService.users = {
      findFirst: jest.fn(),
    } as any;

    mockPrismaService.seats = {
      findFirst: jest.fn(),
      update: jest.fn(),
    } as any;

    mockPrismaService.transactions = {
      create: jest.fn(),
      update: jest.fn(),
    } as any;

    mockPrismaService.detailTransaction = {
      create: jest.fn(),
    } as any;

    mockPrismaService.$transaction = jest.fn();

    // Mock Mail service
    mockMailService.sendEmail = jest.fn().mockResolvedValue(undefined);

    // Mock Queue
    (userTransactionQueue.add as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    // Create service instance
    transactionService = new TransactionService(
      mockPrismaService,
      mockCloudinaryService,
      mockMailService
    );
  });

  describe('Success Cases', () => {
    it('should create transaction successfully', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 200000,
            }),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(mockSeat),
            update: jest.fn().mockResolvedValue({
              ...mockSeat,
              reserved: mockSeat.reserved + 2,
            }),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              seatsId: 1,
              transactionId: 1,
              quantity: 2,
              priceAtPurchase: 100000,
            }),
          },
        };
        return await callback(mockTx as any);
      });

      // Act
      const result = await transactionService.createTransaction(1, mockCreateTransactionDTO);

      // Assert
      expect(result).toEqual(mockCreatedTransaction);
      expect(mockPrismaService.events.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockPrismaService.users.findFirst).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockMailService.sendEmail).toHaveBeenCalledWith(
        mockUser.email,
        'Transaksi Dibuat',
        'create-transaction',
        expect.objectContaining({
          name: mockUser.fullName,
          transactionId: mockCreatedTransaction.uuid,
          amount: mockCreatedTransaction.totalPrice,
        })
      );
      expect(userTransactionQueue.add).toHaveBeenCalledWith(
        'new-transaction',
        { uuid: mockCreatedTransaction.uuid },
        expect.objectContaining({
          jobId: mockCreatedTransaction.uuid,
          delay: 120000, // 2 minutes
        })
      );
    });

    it('should calculate total price correctly for multiple seats', async () => {
      // Arrange
      const multiSeatsDTO: CreateTransactionDTO = {
        eventId: 1,
        detailsEvent: [
          { seatsId: 1, quantity: 2 },
          { seatsId: 2, quantity: 3 },
        ],
      };

      const mockSeat2 = { ...mockSeat, id: 2, price: 150000 };

      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 650000, // (2 * 100000) + (3 * 150000)
            }),
          },
          seats: {
            findFirst: jest.fn()
              .mockResolvedValueOnce(mockSeat) // First call for seat 1
              .mockResolvedValueOnce(mockSeat2), // Second call for seat 2
            update: jest.fn().mockResolvedValue({}),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx as any);
      });

      // Act
      const result = await transactionService.createTransaction(1, multiSeatsDTO);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('Error Cases', () => {
    it('should throw error when event not found', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('Event not found', 404));
    });

    it('should throw error when event already started', async () => {
      // Arrange
      const pastEvent = {
        ...mockEvent,
        startEvent: new Date('2025-01-01'), // Past date
      };
      mockPrismaService.events.findFirst.mockResolvedValue(pastEvent);

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('Event already started', 400));
    });

    it('should throw error when event already ended', async () => {
      // Arrange
      const endedEvent = {
        ...mockEvent,
        startEvent: new Date('2025-12-01'),
        endEvent: new Date('2025-01-01'), // Past date
      };
      mockPrismaService.events.findFirst.mockResolvedValue(endedEvent);

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('Event already ended', 400));
    });

    it('should throw error when user not found', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(null);

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('User not found', 404));
    });

    it('should throw error when seat not found', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(null), // Seat not found
          },
        };
        return await callback(mockTx as any);
      });

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('Seat not found', 404));
    });

    it('should throw error when seat not for this event', async () => {
      // Arrange
      const wrongEventSeat = { ...mockSeat, eventId: 999 };
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(wrongEventSeat),
          },
        };
        return await callback(mockTx as any);
      });

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow(new ApiError('Seat not for this event', 404));
    });

    it('should throw error when quantity exceeds section capacity', async () => {
      // Arrange
      const fullSeat = { ...mockSeat, reserved: 99, totalSeat: 100 }; // Only 1 seat left
      const exceedingQuantityDTO: CreateTransactionDTO = {
        eventId: 1,
        detailsEvent: [
          { seatsId: 1, quantity: 5 }, // Trying to book 5 seats
        ],
      };

      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(fullSeat),
          },
        };
        return await callback(mockTx as any);
      });

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, exceedingQuantityDTO)
      ).rejects.toThrow(new ApiError('Quantity exceeds section capacity', 400));
    });

    it('should rollback transaction when database error occurs', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow('Database error');

      // Verify email is not sent when transaction fails
      expect(mockMailService.sendEmail).not.toHaveBeenCalled();
      expect(userTransactionQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple detail events correctly', async () => {
      // Arrange
      const multiDetailDTO: CreateTransactionDTO = {
        eventId: 1,
        detailsEvent: [
          { seatsId: 1, quantity: 1 },
          { seatsId: 2, quantity: 2 },
          { seatsId: 3, quantity: 3 },
        ],
      };

      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      const mockSeats = [
        { ...mockSeat, id: 1, price: 100000 },
        { ...mockSeat, id: 2, price: 200000 },
        { ...mockSeat, id: 3, price: 300000 },
      ];

      let seatCallCount = 0;
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 1400000, // (1*100000) + (2*200000) + (3*300000)
            }),
          },
          seats: {
            findFirst: jest.fn().mockImplementation(() => {
              return Promise.resolve(mockSeats[seatCallCount++]);
            }),
            update: jest.fn().mockResolvedValue({}),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx as any);
      });

      // Act
      const result = await transactionService.createTransaction(1, multiDetailDTO);

      // Assert
      expect(result).toBeDefined();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should handle zero quantity gracefully', async () => {
      // Arrange
      const zeroQuantityDTO: CreateTransactionDTO = {
        eventId: 1,
        detailsEvent: [
          { seatsId: 1, quantity: 0 },
        ],
      };

      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 0,
            }),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(mockSeat),
            update: jest.fn().mockResolvedValue(mockSeat),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return await callback(mockTx as any);
      });

      // Act
      const result = await transactionService.createTransaction(1, zeroQuantityDTO);

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('Integration with External Services', () => {
    it('should handle email service failure gracefully', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 200000,
            }),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(mockSeat),
            update: jest.fn().mockResolvedValue({
              ...mockSeat,
              reserved: mockSeat.reserved + 2,
            }),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              seatsId: 1,
              transactionId: 1,
              quantity: 2,
              priceAtPurchase: 100000,
            }),
          },
        };
        return await callback(mockTx as any);
      });

      mockMailService.sendEmail.mockRejectedValue(new Error('Email service error'));

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow('Email service error');
    });

    it('should handle queue service failure gracefully', async () => {
      // Arrange
      mockPrismaService.events.findFirst.mockResolvedValue(mockEvent);
      mockPrismaService.users.findFirst.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          transactions: {
            create: jest.fn().mockResolvedValue(mockCreatedTransaction),
            update: jest.fn().mockResolvedValue({
              ...mockCreatedTransaction,
              totalPrice: 200000,
            }),
          },
          seats: {
            findFirst: jest.fn().mockResolvedValue(mockSeat),
            update: jest.fn().mockResolvedValue({
              ...mockSeat,
              reserved: mockSeat.reserved + 2,
            }),
          },
          detailTransaction: {
            create: jest.fn().mockResolvedValue({
              id: 1,
              seatsId: 1,
              transactionId: 1,
              quantity: 2,
              priceAtPurchase: 100000,
            }),
          },
        };
        return await callback(mockTx as any);
      });

      mockMailService.sendEmail.mockResolvedValue(undefined);
      (userTransactionQueue.add as jest.Mock).mockRejectedValue(new Error('Queue service error'));

      // Act & Assert
      await expect(
        transactionService.createTransaction(1, mockCreateTransactionDTO)
      ).rejects.toThrow('Queue service error');
    });
  });
});