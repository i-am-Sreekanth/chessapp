import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-palette-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './palette-box.component.html',
  styleUrls: ['./palette-box.component.scss']
})
export class PaletteBoxComponent implements OnInit {
  @Input() playerColor: 'white' | 'black' = 'white';
  @Input() pieceCounts?: { [key: string]: number };
  @Input() boardSize: number = 650;
  @Output() pieceUsed = new EventEmitter<{ name: string, color: string }>();
  @Output() pieceDragEnd = new EventEmitter<void>();
  @Output() pieceUsedSimple = new EventEmitter<string>();

  pieces: { name: string; icon: string; count: number }[] = [];

  ngOnInit(): void {
    const colorCode = this.playerColor === 'white' ? 'w' : 'b';

    this.pieces = [
      { name: 'King', icon: `assets/chess-pieces/${colorCode}K.png`, count: 1 },
      { name: 'Queen', icon: `assets/chess-pieces/${colorCode}Q.png`, count: 1 },
      { name: 'Rook', icon: `assets/chess-pieces/${colorCode}R.png`, count: 2 },
      { name: 'Bishop', icon: `assets/chess-pieces/${colorCode}B.png`, count: 2 },
      { name: 'Knight', icon: `assets/chess-pieces/${colorCode}N.png`, count: 2 },
      { name: 'Pawn', icon: `assets/chess-pieces/${colorCode}P.png`, count: 8 }
    ];
  }

  onDragStart(event: DragEvent, piece: { name: string; icon: string; count: number }) {
    const externalCount = this.pieceCounts?.[piece.name];
    const internalCount = piece.count;
    const effectiveCount = this.pieceCounts ? externalCount ?? 0 : internalCount;

    if (effectiveCount === 0) {
      event.preventDefault();
      return;
    }

    if (!this.pieceCounts) {
      piece.count--;
    }

    const dragData = {
      name: piece.name,
      icon: piece.icon,
      color: this.playerColor
    };

    event.dataTransfer?.setData('application/json', JSON.stringify(dragData));
    this.pieceUsed.emit({ name: piece.name, color: this.playerColor });
    this.pieceUsedSimple.emit(piece.name);
  }
}
