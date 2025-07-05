import {
  Component,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import {
  NgxChessBoardComponent,
  MoveChange,
  PieceIconInput,
  PieceTypeInput,
  ColorInput,
  NgxChessBoardModule
} from 'ngx-chess-board';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaletteBoxComponent } from '../../components/palette-box/palette-box.component';
import { FenComponent } from '../../components/fen/fen.component';
import { isUserLoggedIn } from '../app.utils';
import { getCurrentUser } from '@aws-amplify/auth';
import { RoomService } from '../../services/room.service';
import { WebsocketService } from '../../services/websocket.service';
import { nanoid } from 'nanoid';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

interface CustomMoveHistory {
  move: string;
  fen: string;
  pgn: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxChessBoardModule,
    PaletteBoxComponent
  ],
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GameComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('board') boardManager!: NgxChessBoardComponent;
  @ViewChild('fenManager') fenManager!: FenComponent;

  player1Name: string = 'player 1';  
  player2Name: string = 'player 2';

  // === Multiplayer WebSocket Subscription ===
  private sub!: Subscription;

  // === Multiplayer ===
  joinCode = '';
  gameLink = '';

  // === Chess Settings ===
  public fen = '8/8/8/8/8/8/8/8 w - - 0 1';
  public manualMove = 'd2d4';
  public pgn = '';
  public darkTileColor = 'rgb(97, 84, 61)';
  public lightTileColor = 'rgb(186,163,120)';
  public size = 800;
  public dragDisabled = false;
  public drawDisabled = false;
  public lightDisabled = false;
  public darkDisabled = false;
  public freeMode = false;
  public addPieceCoords = 'a4';
  public selectedPiece = '1';
  public selectedColor = '1';

  public moveHistory: CustomMoveHistory[] = [];
  private currentStateIndex: number = -1;
  public allSquares: string[] = this.generateAllSquares();

  whitePieces = new Map<string, number>();
  blackPieces = new Map<string, number>();
  draggedPiece: any = null;
  dragSuccess = false;
  gamePhase = 'setup';
  startClicks = 0;
  isDarkMode = true;

  loggedIn = false;
  redirecting = false;
  userEmail: string = '';

  whitePaletteCounts: { [key: string]: number } = {
    King: 1, Queen: 1, Rook: 2, Bishop: 2, Knight: 2, Pawn: 8
  };
  blackPaletteCounts: { [key: string]: number } = {
    King: 1, Queen: 1, Rook: 2, Bishop: 2, Knight: 2, Pawn: 8
  };

  icons: PieceIconInput = {
    blackBishopUrl: '', blackKingUrl: '', blackKnightUrl: '', blackPawnUrl: '',
    blackQueenUrl: '', blackRookUrl: '', whiteBishopUrl: '', whiteKingUrl: '',
    whiteKnightUrl: '', whitePawnUrl: '', whiteQueenUrl: '', whiteRookUrl: ''
  };

  board: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public roomService: RoomService,
    private cdr: ChangeDetectorRef,
    private wsService: WebsocketService
  ) {
    ['King', 'Queen', 'Rook', 'Bishop', 'Knight', 'Pawn'].forEach(piece => {
      this.whitePieces.set(piece, 0);
      this.blackPieces.set(piece, 0);
    });
  }
    private rooms: Map<string, { fen: string; pgn: string; clients: Set<WebSocket> }> = new Map();
  // === Multiplayer Join/Create ===
  joinGame() {
  const trimmedRoom = this.joinCode.trim();
  
  
this.fen = '8/8/8/8/8/8/8/8 w - - 0 1';
this.pgn = '';
this.freeMode = false;

this.roomService.setRoomId(trimmedRoom);
this.wsService.connect();
this.wsService.sendMessage('joinRoom', { roomId: trimmedRoom });
this.router.navigate([], {
  relativeTo: this.route,
  queryParams: { room: trimmedRoom },
  queryParamsHandling: 'merge',

  });
  }
  


  createGame() {
    const roomId = nanoid(6).toUpperCase();
    this.roomService.setRoomId(roomId);
    this.fen = '8/8/8/8/8/8/8/8 w - - 0 1';
    this.freeMode = true;
    this.wsService.connect();
    this.wsService.sendMessage('createRoom', 
      { roomId,
        fen: this.boardManager.getFEN(),
        pgn: this.boardManager.getPGN()
      });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { room: roomId },
      queryParamsHandling: 'merge',
    });
    


  setTimeout(() => {
    if (this.boardManager) {
      this.boardManager.setFEN('8/8/8/8/8/8/8/8 w - - 0 1');
      this.fen = '8/8/8/8/8/8/8/8 w - - 0 1';
      this.freeMode = true;
    }
  }, 1);
  
}

  // === WebSocket Move Handling ===
  onMove(event: { from: string; to: string }): void {
  const fen = this.boardManager.getFEN();
  const pgn = this.boardManager.getPGN();
  this.wsService.sendMessage('sendMove', {
    roomId: this.roomService.getRoomId(),
    move: {
      from: event.from,
      to: event.to
    },
    fen,
    pgn
  });
}

  // === Angular Lifecycle ===
  async ngOnInit() {
    const result = await isUserLoggedIn();
    this.loggedIn = result;

    if (!result) {
      this.redirecting = true;
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/games' } });
      }, 200);
      return;
    } else {
      try {
        const user = await getCurrentUser();
        console.log('User Info:', user);
        this.userEmail = user.signInDetails?.loginId || 'Umknown';
        this.cdr.detectChanges();
      } catch (err) {
        console.error('🔴 Could not fetch user info:', err);
      }
    }



    // === WebSocket Message Subscription ===
  this.sub = this.wsService.onMessage().subscribe((msg) => {
    console.log('[WebSocket] Incoming Message:', msg);
  if (msg.action === 'move' && msg.roomId === this.roomService.getRoomId()) {
    this.boardManager.move(`${msg.move.from}${msg.move.to}`);
    this.fen = msg.fen;
    this.pgn = msg.pgn;
  }

  if (msg.action === 'boardState' && msg.roomId === this.roomService.getRoomId()) {
    this.boardManager.setFEN(msg.fen);
    this.fen = msg.fen;
    this.pgn = msg.pgn;
    this.freeMode = true;
  }

  if (msg.action === 'initGameState' && msg.roomId === this.roomService.getRoomId()) {
    console.log('[WebSocket] Applying initGameState');
    this.boardManager.setFEN(msg.fen);
    this.fen = msg.fen;
    this.pgn = msg.pgn;
    this.boardManager.setPGN(msg.pgn);
    this.freeMode = true;
  }
  if (msg.action === 'roomNotFound') {
  alert(`Room "${msg.roomId}" does not exist.`);
  this.router.navigate(['/games']);  // or show UI error
  return;

}
});
  }

  ngAfterViewInit(): void {
  this.boardManager.setFEN(this.fen);

  const roomFromUrl = this.route.snapshot.queryParamMap.get('room');
  if (roomFromUrl) {
    this.roomService.setRoomId(roomFromUrl);
    this.wsService.sendMessage('joinRoom', { roomId: roomFromUrl });
  }
}


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // === Chess Logic ===
  private broadcastState(action = 'boardState'): void {
  this.wsService.sendMessage(action, {
    roomId: this.roomService.getRoomId(),
    fen: this.boardManager.getFEN(),
    pgn: this.boardManager.getPGN()
  });
}

  toggleDarkMode(enabled: boolean): void {
    this.isDarkMode = enabled;
    document.body.classList.toggle('light-mode', !enabled);
  }

  onBoardSizeChange(value: string): void {
    const newSize = parseInt(value, 10);
    if (!isNaN(newSize) && newSize >= 400 && newSize <= 1000) {
      this.size = newSize;
    }
  }

  onDragStart(event: any, piece: any) { this.draggedPiece = piece; }

  onDragEnd() {
    if (!this.dragSuccess && this.draggedPiece) {
      const { name, color } = this.draggedPiece;
      const palette = color === 'white' ? this.whitePaletteCounts : this.blackPaletteCounts;
      palette[name]++;
    }
    this.dragSuccess = false;
    this.draggedPiece = null;
  }

  onBoardDragOver(event: DragEvent) { event.preventDefault(); }

  onBoardDrop(event: DragEvent) {
    event.preventDefault();
    const data = event.dataTransfer?.getData('application/json');
    if (data) {
      const piece = JSON.parse(data);
      const square = this.getSquareFromDrop(event);
      if (square) this.placePieceOnBoard(square, piece);
    }
  }

  getSquareFromDrop(event: DragEvent): string | null {
    const boardElement = document.getElementById('board-drop-wrapper');
    if (!boardElement) return null;
    const rect = boardElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const squareSize = rect.width / 8;
    const file = ['a','b','c','d','e','f','g','h'][Math.floor(x / squareSize)];
    const rank = ['8','7','6','5','4','3','2','1'][Math.floor(y / squareSize)];
    return file && rank ? file + rank : null;
  }

  placePieceOnBoard(square: string, piece: { name: string; color: string }) {
  const type = this.mapPieceNameToPieceType(piece.name);
  const color = piece.color === 'white' ? ColorInput.LIGHT : ColorInput.DARK;
  this.boardManager.addPiece(type, color, square);
  this.broadcastState('boardState');
}


  private mapPieceNameToPieceType(name: string): PieceTypeInput {
    switch (name.toLowerCase()) {
      case 'queen': return PieceTypeInput.QUEEN;
      case 'king': return PieceTypeInput.KING;
      case 'rook': return PieceTypeInput.ROOK;
      case 'bishop': return PieceTypeInput.BISHOP;
      case 'knight': return PieceTypeInput.KNIGHT;
      case 'pawn': return PieceTypeInput.PAWN;
      default: throw new Error(`Unknown piece name: ${name}`);
    }
  }

  public reset(): void {
    alert('Resetting board');
    this.boardManager.setFEN('8/8/8/8/8/8/8/8 w - - 0 1');
    this.fen = this.boardManager.getFEN();
    this.freeMode = false;
    this.moveHistory = [];
    this.currentStateIndex = -1;
    this.broadcastState();
  }

  public reverse(): void { this.boardManager.reverse(); }

  public undo(): void {
    this.boardManager.undo();
    this.fen = this.boardManager.getFEN();
    this.pgn = this.boardManager.getPGN();
    this.broadcastState();
  }

  public setFen():void {
  this.boardManager.setFEN(this.fen);
  this.broadcastState();
}

  public moveManual(): void { this.boardManager.move(this.manualMove); }

  getFEN() { alert(this.boardManager.getFEN()); }

  getPGN() { alert(this.boardManager.getPGN()); }

  showMoveHistory() { alert(JSON.stringify(this.moveHistory)); }

  switchDrag() { this.dragDisabled = !this.dragDisabled; }

  switchDraw() { this.drawDisabled = !this.drawDisabled; }

  switchDarkDisabled() { this.darkDisabled = !this.darkDisabled; }

  switchLightDisabled() { this.lightDisabled = !this.lightDisabled; }

  switchFreeMode() { this.freeMode = !this.freeMode; }

  addPiece() {
    const piece = this.resolveSelectedPiece();
    const color = this.resolveSelectedColor();
    this.boardManager.addPiece(piece, color, this.addPieceCoords);
    this.broadcastState();
  }

  private resolveSelectedPiece(): PieceTypeInput {
    switch (this.selectedPiece) {
      case '1': return PieceTypeInput.QUEEN;
      case '2': return PieceTypeInput.KING;
      case '3': return PieceTypeInput.ROOK;
      case '4': return PieceTypeInput.BISHOP;
      case '5': return PieceTypeInput.KNIGHT;
      case '6': return PieceTypeInput.PAWN;
      default: return PieceTypeInput.QUEEN;
    }
  }

  private resolveSelectedColor(): ColorInput {
    switch (this.selectedColor) {
      case '1': return ColorInput.LIGHT;
      case '2': return ColorInput.DARK;
      default: return ColorInput.LIGHT;
    }
  }

  public setPgn() { this.boardManager.setPGN(this.pgn); }

  loadDefaultPgn() {
    this.pgn = '1. c4 b5 2. cxb5 c6 3. bxc6 Nxc6 4. Qa4 a6\n' +
      '5. Qxa6 Rb8 6. b3 d5 7. f4 e5 8. fxe5 f6\n' +
      '9. exf6 gxf6 10. Nf3 f5 11. Ne5 Bb7 12. Qxb7 Na7\n' +
      '13. Qxb8 Qxb8 14. Kf2 Kd8 15. Nc3 Be7 16. Nc4 Bf6\n' +
      '17. Nb6 Nb5 18. Nbxd5 f4 19. Ne4 Na7 20. Nexf6';
    this.setPgn();
  }

  public goBack(): void {
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--;
      const fen = this.moveHistory[this.currentStateIndex].fen;
      this.boardManager.setFEN(fen);
    } else alert('No earlier moves.');
  }

  public goForward(): void {
    if (this.currentStateIndex < this.moveHistory.length - 1) {
      this.currentStateIndex++;
      const fen = this.moveHistory[this.currentStateIndex].fen;
      this.boardManager.setFEN(fen);
    } else alert('No further moves.');
  }

  decrementPiece(pieceName: string, color: 'white' | 'black') {
    const palette = color === 'white' ? this.whitePaletteCounts : this.blackPaletteCounts;
    if (palette[pieceName] > 0) palette[pieceName]--;
  }

  private generateAllSquares(): string[] {
    const files = ['a','b','c','d','e','f','g','h'];
    const ranks = [8,7,6,5,4,3,2,1];
    const squares = [];
    for (const rank of ranks) {
      for (const file of files) squares.push(file + rank);
    }
    return squares;
  }

  public moveCallback(move: MoveChange): void {
  this.fen = this.boardManager.getFEN();
  this.pgn = this.boardManager.getPGN();

  // Save in local history
  const newMove: CustomMoveHistory = {
    move: move.move,
    fen: this.fen,
    pgn: this.pgn
  };
  this.moveHistory = this.moveHistory.slice(0, this.currentStateIndex + 1);
  this.moveHistory.push(newMove);
  this.currentStateIndex = this.moveHistory.length - 1;

  // Broadcast move to backend
  const from = move.move.substring(0, 2);
  const to = move.move.substring(2, 4);
  this.wsService.sendMessage('sendMove', {
    roomId: this.roomService.getRoomId(),
    move: { from, to },
    fen: this.fen,
    pgn: this.pgn
  });
}


  copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
    });
  }

}