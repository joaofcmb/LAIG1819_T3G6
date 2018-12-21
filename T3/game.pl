%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Includes %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

:-use_module(library(sockets)).
:-use_module(library(lists)).
:-use_module(library(codesio)).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Server %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% To run, enter 'server.' on sicstus command line after consulting this file.
% You can test requests to this server by going to http://localhost:8081/<request>.
% Go to http://localhost:8081/quit to close server.

% Made by Luis Reis (ei12085@fe.up.pt) for LAIG course at FEUP.

port(8081).

% Server Entry Point
server :-
	port(Port),
	write('Opened Server'),nl,nl,
	socket_server_open(Port, Socket),
	server_loop(Socket),
	socket_server_close(Socket),
	write('Closed Server'),nl.

% Server Loop 
% Uncomment writes for more information on incomming connections
server_loop(Socket) :-
	repeat,
	socket_server_accept(Socket, _Client, Stream, [type(text)]),
		% write('Accepted connection'), nl,
	    % Parse Request
		catch((
			read_request(Stream, Request),
			read_header(Stream)
		),_Exception,(
			% write('Error parsing request.'),nl,
			close_stream(Stream),
			fail
		)),
		
		% Generate Response
		handle_request(Request, MyReply, Status),
		format('Request: ~q~n',[Request]),
		format('Reply: ~q~n', [MyReply]),
		
		% Output Response
		format(Stream, 'HTTP/1.0 ~p~n', [Status]),
		format(Stream, 'Access-Control-Allow-Origin: *~n', []),
		format(Stream, 'Content-Type: text/plain~n~n', []),
		format(Stream, '~p', [MyReply]),
	
		% write('Finnished Connection'),nl,nl,
		close_stream(Stream),
	(Request = quit), !.
	
close_stream(Stream) :- flush_output(Stream), close(Stream).

% Handles parsed HTTP requests
% Returns 200 OK on successful aplication of parse_input on request
% Returns 400 Bad Request on syntax error (received from parser) or on failure of parse_input
handle_request(Request, MyReply, '200 OK') :- catch(parse_input(Request, MyReply),error(_,_),fail), !.
handle_request(syntax_error, 'Syntax Error', '400 Bad Request') :- !.
handle_request(_, 'Bad Request', '400 Bad Request').

% Reads first Line of HTTP Header and parses request
% Returns term parsed from Request-URI
% Returns syntax_error in case of failure in parsing
read_request(Stream, Request) :-
	read_line(Stream, LineCodes),
	print_header_line(LineCodes),
	
	% Parse Request
	atom_codes('GET /',Get),
	append(Get,RL,LineCodes),
	read_request_aux(RL,RL2),	
	
	catch(read_from_codes(RL2, Request), error(syntax_error(_),_), fail), !.
read_request(_,syntax_error).
	
read_request_aux([32|_],[46]) :- !.
read_request_aux([C|Cs],[C|RCs]) :- read_request_aux(Cs, RCs).


% Reads and Ignores the rest of the lines of the HTTP Header
read_header(Stream) :-
	repeat,
	read_line(Stream, Line),
	print_header_line(Line),
	(Line = []; Line = end_of_file),!.

check_end_of_header([]) :- !, fail.
check_end_of_header(end_of_file) :- !,fail.
check_end_of_header(_).

% Function to Output Request Lines (uncomment the line bellow to see more information on received HTTP Requests)
% print_header_line(LineCodes) :- catch((atom_codes(Line,LineCodes),write(Line),nl),_,fail), !.
print_header_line(_).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Commands %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Require your Prolog Files here

parse_input(handshake, handshake).
parse_input(test(C,N), Res) :- test(C,Res,N).
parse_input(quit, goodbye).

test(_,[],N) :- N =< 0.
test(A,[A|Bs],N) :- N1 is N-1, test(A,Bs,N1).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Utility Predicates %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Finds the max of a list

% ?Max - Maximum element of the list
% +List - List to find the max on
max(Max, [H|T]) :- max(Max, H, T).

max(Max, Max, []).
max(Max, CurrMax, [H|T]) :- H > CurrMax, !,
							max(Max, H, T).
max(Max, CurrMax, [_|T]) :- max(Max, CurrMax, T).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Board Manipulation %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: boardSize/3, emptyBoard/1, fullBoard/1, getPiece/4 and setPiece/5
% Auxiliary Predicates: getLine/3, getColumn/3, setLine/4 and setColumn/4


% Initial State of Board:			 
initialBoard('7x7', [	['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0']
					 ]).
					 
initialBoard('9x9', [	['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0'],
						['0', '0', '0', '0', '0', '0', '0', '0', '0']
					 ]).					 
				 
initialBoard('13x13', [ 	['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'],
							['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
						 ]).				 

% Symbol converter
modelToView('0','+').
modelToView('1','O').
modelToView('2','X').
modelToView('3','#').

% Option converter
optionConverter(1,'easyAI').
optionConverter(2,'mediumAI').
optionConverter(3,'hardAI').

% Board size converter
boardSizeConverter(1,'7x7').
boardSizeConverter(2,'9x9').
boardSizeConverter(3,'13x13').
boardSizeConverter(7,'7x7').
boardSizeConverter(9,'9x9').
boardSizeConverter(13,'13x13').

% Winning conditions

% +BoardSize:   Specifies the board size 
% +NumCaptures: Number of captures needed to be made in order to win the game in the specified board size
% +NumSequence: Number of pieces in a row needed in order to win the game in the specified board size
winning_conditions(7 , 5 , 4).
winning_conditions(9 , 7 , 4).
winning_conditions(13, 10, 5).


% Retrieves the dimensions of a rectangular board.

% +Board: 	 	Internal Representation of the board to be checked.
% -LineSize: 	Number of Lines in the board.
% -ColumnSize: 	Number of Columns in the board.
boardSize(Board, LineSize, ColSize):-	Board = [FirstLine | _],
										length(Board, LineSize),
										length(FirstLine, ColSize).
												
												
% Succeeds if the board is empty (is in its initial state)

% +Board: Internal Representation of the board to be checked.
emptyBoard(Board):- length(Board, Size),
					boardSizeConverter(Size, BoardSize), !,
					initialBoard(BoardSize, Board).

% Succeeds if the board is full (resulting in a draw)

% +Board: Internal Representation of the board to be checked.
fullBoard([]).
fullBoard([H|T]):- 	fullLine(H),
					fullBoard(T).
fullLine([]).
fullLine([H|T]):-	H \= '0',
					fullLine(T).
					

% Retrieves a Cell from a given board.

%	+LinNo: Row number for the cell to be retrieved.
%  	+ColNo: Row number for the cell to be retrieved.
%	+Board: Internal Representation of the board.
%	?Piece: Cell value retrieved from the board
getPiece(LinNo, ColNo, Board, Piece):-	boardSize(Board, LineSize, ColSize),
										LinNo >= 1, LinNo =< LineSize,
										ColNo >= 1, ColNo =< ColSize,
										!,
										getLine(LinNo, Board, Line), 
										getColumn(ColNo, Line, Piece), !.
	
getPiece(_, _, _, Piece):- 				modelToView(Piece, '#'), !.

% Retrieves a Line from a given board.

%	+LinNo: Number of the line to be retrieved.
%	+Board: Internal Representation of the board.
%	-Line: 	Line retrieved from the board
getLine(LinNo, Board, Line):-	length(Board, MaxLines),
								getLine(LinNo, MaxLines, Board, Line).
	
getLine(MaxLines, MaxLines, [Line|_], Line).
getLine(LinNo, MaxLines, [_|RestBoard], Line):-	NextLineNo is LinNo + 1, 
												getLine(NextLineNo, MaxLines, RestBoard, Line).

% Retrieves a cell from a given line.

%	+ColNo: Number of the cell to be retrieved.
%	+Line: 	List containing the elements of the line.
%	-Piece: Cell value to be retrieved from the line
getColumn(1, [Piece|_], Piece).
getColumn(ColNo, [_|RestLine], Piece):-	ColNo > 1, 
										PrevColNo is ColNo - 1, 
										getColumn(PrevColNo, RestLine, Piece). 

% Sets a cell on a board.

%	+LinNo: 	Row number for the cell to be edited.
%  	+ColNo: 	Row number for the cell to be edited.
%	+OldBoard: 	Internal Representation of the board before being edited.
%	-NewBoard: 	Internal Representation of the board after being edited.
%	+Piece: 	Cell value to be attributed.
setPiece(LinNo, ColNo, OldBoard, NewBoard, Piece):-	getLine(LinNo, OldBoard, OldLine), 
													setColumn(ColNo, Piece, OldLine, NewLine),
													setLine(LinNo, NewLine, OldBoard, NewBoard).
	
% Edits a cell from a given line.

%	+ColNo: 	Number of the cell to be edited.
%	+Piece: 	Cell value to be attributed.
%	+OldLine: 	List containing the elements of the line before being edited.
%	-NewLine: 	List containing the elements of the line after being edited.
setColumn(1, Piece, [_|T], [Piece|T]).
setColumn(ColNo, Piece, [H|T], [H|R]) :-	ColNo > 1, 
											PrevColNo is ColNo - 1,
											setColumn(PrevColNo, Piece, T, R).
							
% Edits a line from a given board.

%	+LinNo: 	Number of the line to be replaced.
%	+Line: 		Line to be attributed to the board.
%	+OldBoard: 	Internal Representation of the board before being edited.
%	-NewBoard: 	Internal Representation of the board after being edited.
setLine(LinNo, Line, OldBoard, NewBoard) :-	length(OldBoard, MaxLines),
											setLine(LinNo, MaxLines, Line, OldBoard, NewBoard).
	
setLine(MaxLines, MaxLines, NewLine, [_|T], [NewLine|T]).					
setLine(LinNo, MaxLines, NewLine, [H|Told], [H|Tnew]) :-	LinNo < MaxLines,
															PrevLinNo is LinNo + 1,
															setLine(PrevLinNo, MaxLines, NewLine, Told, Tnew).										


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Game Initializer %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: play/0, displayMainMenu/2, displayGameTitle/0, initGame/1, handleMenuInput/2, menuInput/1

% Initializes the game by displaying the main menu
play:- displayMainMenu(0, _).

% Displays game title 
displayGameTitle:- 	nl,
					format('##############################################################################~n', []),
					format('#                                                                            #~n', []),
					format('#    ############ ############  ######       ### ############ ############   #~n', []),
					format('#    ############ ############  ### ###      ### ############ ############   #~n', []),
					format('#    ###      ### ###           ###  ###     ###     ###      ###            #~n', []),
					format('#    ############ #########     ###   ###    ###     ###      #########      #~n', []),
					format('#    ############ #########     ###    ###   ###     ###      #########      #~n', []),
					format('#    ###          ###           ###     ###  ###     ###      ###            #~n', []),
					format('#    ###          ############  ###      ### ###     ###      ############   #~n', []),
					format('#    ###          ############  ###       ######     ###      ############   #~n', []),
					format('#                                                                            #~n', []),
					format('##############################################################################~n', []),
					format('#                                                                            #~n', []).

% Displays the different type of menus

% +Option:  	Determines which menu should be shown
% +Difficulty: 	Difficulty selected by the user				
displayMainMenu(0, _):- 	displayGameTitle,
							format('#                             1) Play Game                                   #~n', []),
							format('#                                                                            #~n', []),
							format('#                             2) Rules                                       #~n', []),
							format('#                                                                            #~n', []),
							format('#                             3) Exit                                        #~n', []),
							format('#                                                                            #~n', []),
							format('##############################################################################~n~n', []),
							handleMenuInput(0,_).
					
displayMainMenu(1, _):-	displayGameTitle,
						format('#                             1) Player vs Player                            #~n', []),
						format('#                                                                            #~n', []),
						format('#                             2) Player vs AI                                #~n', []),
						format('#                                                                            #~n', []),
						format('#                             3) AI vs AI                                    #~n', []),
						format('#                                                                            #~n', []),
						format('#                             4) Back                                        #~n', []),
						format('#                                                                            #~n', []),
						format('##############################################################################~n~n', []),
						handleMenuInput(1,_).

displayMainMenu(2, _):- displayGameTitle,
						format('# 1) First move must be made in the center of the board.                     #~n', []),
						format('#                                                                            #~n', []),
						format('# 2) Captures occur when, along any direction, two contiguous stones of a    #~n', []),
						format('#    symbol are surrounded by two stones of another symbol.                  #~n', []),
						format('#                                                                            #~n', []),
						format('# 3) Winning conditions: X pieces in sequence or making Y captures.          #~n', []),
						format('#    Both X and Y depend on the board size                                   #~n', []),
						format('#                                                                            #~n', []),
						format('# 4) If all the board cells are occupied without any of the winning          #~n', []),
						format('#    conditions applying to a player, the game is considered a draw.         #~n', []),
						format('#                                                                            #~n', []),
						format('##############################################################################~n~n', []),
						format('Press any key to continue', []), read(_),
						displayMainMenu(0, _).
						
displayMainMenu(3, _).						
						
displayMainMenu(4, Difficulty):- 	displayGameTitle,
									format('#                             DIFFICULTY                                     #~n', []),
									format('#                                                                            #~n', []),
									format('##############################################################################~n', []),
									format('#                                                                            #~n', []),
									format('#                             1) Easy                                        #~n', []),
									format('#                                                                            #~n', []),
									format('#                             2) Medium                                      #~n', []),
									format('#                                                                            #~n', []),
									format('#                             3) Hard                                        #~n', []),
									format('#                                                                            #~n', []),
									format('##############################################################################~n~n', []),
									handleMenuInput(2, Difficulty).	

displayMainMenu(5, BoardSize):- 	displayGameTitle,
									format('#                             BOARD SIZE                                     #~n', []),
									format('#                                                                            #~n', []),
									format('##############################################################################~n', []),
									format('#                                                                            #~n', []),
									format('#               1) 7x7    (5 captures  | 4 pieces in a row)                  #~n', []),
									format('#                                                                            #~n', []),
									format('#               2) 9x9    (7 captures  | 6 pieces in a row)                  #~n', []),
									format('#                                                                            #~n', []),
									format('#               3) 13x13  (10 captures | 5 pieces in a row)                  #~n', []),
									format('#                                                                            #~n', []),
									format('##############################################################################~n~n', []),
									handleMenuInput(3, BoardSize).										
										
% Initialiazes the game considering user options

% +Option: 	Selected option										
initGame(1):- 	displayMainMenu(5, BoardSize),
				startGame(BoardSize), !.
initGame(2):-	displayMainMenu(4, AIType),
				displayMainMenu(5, BoardSize),
				startGame(BoardSize, AIType), !.
initGame(3):- 	displayMainMenu(4, AIType),
				displayMainMenu(5, BoardSize),
				startGame(BoardSize, AIType, AIType), !.
initGame(4):- 	displayMainMenu(0, _).
					

% Handles main menu input

% +Option:  Option selected by the user
% -Difficulty: Difficulty choosen by the user					
handleMenuInput(0, _):- 	menuInput(Option),
							displayMainMenu(Option, _).
					
handleMenuInput(1, _):- 	menuInput(Option),
							initGame(Option).	

handleMenuInput(2, Difficulty):-	menuInput(Option),
									optionConverter(Option, Difficulty).
									
handleMenuInput(3, BoardSize):-		menuInput(Option),
									boardSizeConverter(Option, BoardSize).									
					
handleMenuInput(Option, Var):-		format('Invalid option. Try again ! ~n~n',[]),
									handleMenuInput(Option, Var).
															
% Retrieves the player input															
menuInput(Option):- format('Select option: ', []),
					read(Option).

															
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Game Display %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: displayGame/1, displayPlayerInfo/0
% Auxiliary Predicates: displayColSymb/1, displayLine/2, displayRow/1, displaySepLine/1


% Displays the game board in a user friendly format.
% The board must be rectangular.
% The board will be improperly displayed if it contains 100 or more lines (100+ Lines will be offset to the right)
% or if there are more than 26 columns (identifiers will still correspond to a single character, however it'll keep going beyond letters).

% +Board: Internal Representation of the board to be displayed.								
displayGame(Board):-	Board = [FirstLine | _],
						length(Board, LineSize),
						length(FirstLine, ColSize),
						displayColSymb(ColSize),
						displayGame(Board, LineSize, ColSize),
						displayColSymb(ColSize).
	
displayGame([H], LineNumber, _):-			displayLine(H, LineNumber).											
displayGame([H|T], LineNumber, ColSize):-	displayLine(H, LineNumber),
											displaySepLine(ColSize),
											NextLineNumber is LineNumber - 1,
											displayGame(T, NextLineNumber, ColSize).


% Displays a Row containing the identifiers of the collumns, allowing the player to easily identify cells

% +Size: Number of columns in the board to be displayed.
displayColSymb(Size):-	char_code('A', CharCode),
						write('\n   '), 
						displayColSymb(Size, 1, CharCode), 
						write('\n\n').
						
displayColSymb(Size, Size, CharCode):-	put_code(CharCode).
displayColSymb(Size, ColNo, CharCode):-	put_code(CharCode),
										write('  '),
										IncColNo is ColNo + 1,
										IncCharCode is CharCode + 1,
										displayColSymb(Size, IncColNo, IncCharCode).

										
% Display a Row of the board with its identifier, allowing the player to easily identify cells

% +BoardLine:	List representation of the Line to be displayed
% +LineNumber:	Number of the Line to be displayed
displayLine(BoardLine, LineNumber):- 	LineNumber < 10,
										format(" ~p ", [LineNumber]),
										displayRow(BoardLine),
										format(" ~p~n", [LineNumber]).
displayLine(BoardLine, LineNumber):- 	format("~p ", [LineNumber]),
										displayRow(BoardLine),
										format(" ~p~n", [LineNumber]).

% Display a Row of the board

% +BoardLine: List representation of the Line to be displayed
displayRow([H|[]]):- 	modelToView(H,Symb), 
						put_char(Symb).
displayRow([H|T]):- 	modelToView(H,Symb), 
						put_char(Symb),
						write('--'), 
						displayRow(T).										

						
% Displays a Line of characters between two different rows, providing a better visual experience

% +Size - Number of columns in the board to be displayed
displaySepLine(Size):- 	write('   '), 
						dispSepLine(Size).

dispSepLine(1):- 		write('|\n').
dispSepLine(Size):- 	write('|  '),
						DecSize is Size - 1,
						dispSepLine(DecSize).	
						

% Displays information about each players' number of captures 						
displayPlayerCaptInfo(player(_, '1', P1Captures, _), player(_, '2', P2Captures, _)):-	format('   Player One -> [~p] Captures    ', P1Captures), 
																						format('   Player Two -> [~p] Captures~n~n', P2Captures).
displayPlayerCaptInfo(PlayerTwo, PlayerOne):- displayPlayerCaptInfo(PlayerOne, PlayerTwo).																								
						

% Displays AI, id turn						
displayPlayerTurn(player(_, PieceID, _, _)):- 	modelToView(PieceID, PieceSymb),
												format('-> Player ~p [~p] turn.~n~n', [PieceID, PieceSymb]).
						
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Input Handling %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: handleInput/4.
% Auxiliary Predicates: userInput/3, flushInput/0, readLine/1, readColumn/1, validateUserInput/3.

% Handles Player Input for current turn.
% The output provided is compatible with the board accessors, in particular setPiece/5.

% +Board: 	 Internal Representation of the Board in its current state.
% +PlayerID: ID of the Player whose input is being retrieved.
% -Line: 	 Line number chosen by the player for its turn.
% -Column: 	 Column number chosen by the player for its turn.
handleInput(Board, player(_, PieceID, _, _), Line, Column):- 	userInput(PieceID, Line, Column),
																validateUserInput(Board, Line, Column), !.
handleInput(Board, Player, Line, Column):-	emptyBoard(Board), !,
											format('~n   Invalid move. First move must be at the center of the board.~n~n', []),
											handleInput(Board, Player, Line, Column).
handleInput(Board, Player, Line, Column):-	format('~n   Invalid move. Chosen cell is either invalid or occupied.~n~n', []),
											handleInput(Board, Player, Line, Column).

% Retrieves the player input (after processing)

% +PieceID:	Model ID of the player's piece.
% -Line: 	Line number chosen by the player for its turn.
% -Column: 	Column number chosen by the player for its turn.
userInput(PieceID, Line, Column):-	modelToView(PieceID, PieceSymb),
									format('-> Player ~p [~p] turn:~n~n', [PieceID, PieceSymb]),
									write('   Line: '),   read(Line),
									write('   Column: '), read(Column),
									nl.
					
% Suceeds if the provided user input is valid.
% If the board has even columns of lines, the middle will be offset to the right / down.

% +Board: 	Internal Representation of the Board in its current state.
% +Line: 	Line number chosen by the player for its turn.
% +Column: 	Column number chosen by the player for its turn.
validateUserInput(Board, Line, Column):- 	emptyBoard(Board),
											!,
											boardSize(Board, LineSize, ColSize),
											Line * 2 =:= LineSize + 1,
											Column * 2 =:= ColSize + 1.
validateUserInput(Board, Line, Column):-	getPiece(Line, Column, Board, '0').
											
											
											
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Game State Transitions %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Game Initial State:					startGame/0, startGame/1, startGame/2
% Game State Handling and Transition:	gameStep/3,  game_over/4
% Board State Handling and Transition: 	move/7
% Game End States:						winGame/3, drawGame/3

% Initializes the game in its initial state (Empty Board)
startGame(BoardSize) :- initialBoard(BoardSize, Board),
						gameStep(Board, player(playerOne, '1', 0, 0), player(playerTwo, '2', 0, 0)).
			 
startGame(BoardSize, AIType) :- initialBoard(BoardSize, Board),
								gameStep(Board, player(playerOne, '1', 0, 0), player(AIType, '2', 0, 0)).

startGame(BoardSize, AIType1, AIType2) :- 	initialBoard(BoardSize, Board),
											gameStep(Board, player(AIType1, '1', 0, 0), player(AIType2, '2', 0, 0)).

% Computes a single game state.

% +Board: 		Internal Representation of the Board in its current state.
% +CurrPlayer:	ID of the Player going to play this turn
% +NextPlayer:	ID of this turn's player opponent.
% +Limit:		Limits the board to optimize the AI (to avoid processing unnecessary cells)
gameStep(Board, CurrPlayer, NextPlayer) :- 	aiDepth(CurrPlayer, Depth), % If the CurrPlayer is an AI, this will succeed and return the depth depending on the AI type (Difficulty)
											!,
											displayGame(Board),
											displayPlayerCaptInfo(CurrPlayer, NextPlayer),
											displayPlayerTurn(CurrPlayer),
											choose_move(Board, NewBoard, CurrPlayer, NextPlayer, NewCurrPlayer, Depth, Score),
											game_over(NewBoard, NextPlayer, NewCurrPlayer, Score), !.

gameStep(Board, CurrPlayer, NextPlayer) :- 	displayGame(Board),	
											displayPlayerCaptInfo(CurrPlayer, NextPlayer),
											!,
											handleInput(Board, CurrPlayer, Line, Column), !,
											move(Board, NewBoard, CurrPlayer, NextPlayer, NewCurrPlayer, Line, Column, Score),	!,
											game_over(NewBoard, NextPlayer, NewCurrPlayer, Score), !.


% Handles the transition between two board states. 
% This including updating the board and checking its current status in respect to the game

% +Board:		 	Internal Representation of the Board in its current state.
% -NewBoard:	 	Internal Representation of the Board in its resulting state.
% +CurrPlayer:	 	Internal Representation of the Player going to play this turn before processing it.
% +NextPlayer:	 	Internal Representation of the opponent of the Player playing this turn.
% -NewCurrPlayer:	Internal Representation of the Player going to play this turn after processing it.
% +SetLine:		 	Line of the cell where the player is playing his piece.
% +SetColumn:	 	Column of the cell where the player is playing his piece.
% -Score:		 	Score of the resulting state (Used to evaluate AI movements and end states) Range:[-100, 100].
move(Board, NewBoard, player(CurrPlayerID, CurrPiece, CurrCaptureNo, CurrSequenceNo), player(_, NextPiece, NextCaptureNo, NextSequenceNo), player(CurrPlayerID, CurrPiece, NewCaptureNo, NewSequenceNo), SetLine, SetColumn, Score) :- 	
		setPiece(SetLine, SetColumn, Board, SetBoard, CurrPiece),
		updateSequence(CurrPiece, SetBoard, SetLine, SetColumn, CurrSequenceNo, NewSequenceNo),
		updateCaptures(CurrPiece, NextPiece, SetBoard, NewBoard, SetLine, SetColumn, CurrCaptureNo, NewCaptureNo),
		length(Board, Size),
		value(Size, NewCaptureNo, NewSequenceNo, NextCaptureNo, NextSequenceNo, Score). 

% Handles the transition between two game states		

% +NewBoard:		Internal Representation of the Board to be transitioned to the next state. 
% +NewCurrPlayer:	Internal Representation of the Player going to play the next turn. 
% +NewNextPlayer:	Internal Representation of the opponent of the Player playing the next turn.
% +Score:			Score of the game state (Used to evaluate AI movements and end states) Range:[-100, 100].
game_over(NewBoard, NewCurrPlayer, NewNextPlayer, 100) 	:- 	!, winGame(NewBoard, NewNextPlayer, NewCurrPlayer). 	% The player who played the previous turn won the game (NewNextPlayer).
game_over(NewBoard, NewCurrPlayer, NewNextPlayer, _) 	:- 	fullBoard(NewBoard), !, drawGame(NewBoard, NewNextPlayer, NewCurrPlayer).
game_over(NewBoard, NewCurrPlayer, NewNextPlayer, _) 	:- 	!, gameStep(NewBoard, NewCurrPlayer, NewNextPlayer).


% Ends the game, displaying the final state of the board and final stats of the players

% +Board:			Internal Representation of the Board in its final state.
% +WinningPlayer:	Internal Representation of the Player who won the game.
% +LosingPlayer:	Internal Representation of the Player who lost the game.
winGame(Board, player(_, Num, _, _), _LosingPlayer):- 	displayGame(Board),
														format('-> Victory: Player ~p won the game!\n\n', Num).

% Ends the game, displaying the final state of the board and final stats of the players

% +Board:			Internal Representation of the Board in its final state.
% +WinningPlayer:	Internal Representation of the Player who won the game.
% +LosingPlayer:	Internal Representation of the Player who lost the game.
drawGame(Board, _WinningPlayer, _LosingPlayer):- 	displayGame(Board),
													write('-> Draw: The board has been filled with neither players winning!\n\n').														
				
				
				
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Sequence and Capture Check %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: 					updateSequence/6, updateCaptures/7

% Auxiliary predicates: getSequence/5, getSequence/6, sequence/8, getCaptures/7, capture/8


% types of directions and their row and column increment
direction(horizontal ,  0, 1).
direction(vertical   ,  1, 0).
direction(posDiagonal,  1, 1).
direction(negDiagonal, -1, 1).


% Updates the Sequence Number of the player whose turn is being processed.

% Must be called after the board is updated with the player's new piece

% +Piece: 			Model ID of the player's piece.
% +Board:			Internal Representation of the Board this turn, after being updated.
% +SetLine:			Line of the cell where the player placed his piece this turn.
% +SetColumn:		Column of the cell where the player placed his piece this turn.
% +CurrSequenceNo: 	Maximum sequence of pieces in a row the player has before this turn.
% -NewSequenceNo: 	Maximum sequence of pieces in a row the player has after this turn.
updateSequence(Piece, Board, SetLine, SetColumn, CurrSequenceNo, NewSequenceNo) :- 	getSequence(Piece, Board, SetLine, SetColumn, CalcSequenceNo), 
																					max(NewSequenceNo, [CalcSequenceNo, CurrSequenceNo]).

																				
% Calculates the Sequence Number from the player's latest move.

% Must be called after the board is updated with the player's new piece

% +Piece: 			Model ID of the player's piece.
% +Board:			Internal Representation of the Board this turn, after being updated.
% +SetLine:			Line of the cell where the player placed his piece this turn.
% +SetColumn:		Column of the cell where the player placed his piece this turn.
% -CalcSequenceNo: 	Maximum sequence of pieces in a row from this turn's move.
getSequence(Piece, Board, SetLine, SetColumn, MaxSequenceNo) :-	getSequence(horizontal,  Piece, Board, SetLine, SetColumn, HorizontalSequenceNo),
																getSequence(vertical, 	 Piece, Board, SetLine, SetColumn, VerticalSequenceNo),
																getSequence(posDiagonal, Piece, Board, SetLine, SetColumn, PosDiagonalSequenceNo),
																getSequence(negDiagonal, Piece, Board, SetLine, SetColumn, NegDiagonalSequenceNo),
																max(MaxSequenceNo, [HorizontalSequenceNo, VerticalSequenceNo, PosDiagonalSequenceNo, NegDiagonalSequenceNo]).
																
getSequence(Direction, Piece, Board, SetLine, SetColumn, MaxSequenceNo) :-	direction(Direction, LineInc, ColInc),
																			LineDec is -LineInc, ColDec is -ColInc,
																			sequence(Piece, Board, SetLine, SetColumn, LineDec, ColDec, -1,  LeftSequenceNo), % Starts in -1 to compensate duplicate counting of the start cell.
																			sequence(Piece, Board, SetLine, SetColumn, LineInc, ColInc, LeftSequenceNo, MaxSequenceNo).
																		
% Calculates the Sequence Number in a direction (including the starting cell) accumulated with an initial value.

% +Piece: 			Model ID of the player's piece.
% +Board:			Internal Representation of the Board this turn, after being updated.
% +SetLine:			Line of the cell being processed first.
% +SetColumn:		Column of the cell being processed first.
% +LineInc:			Line value to be incremented each step of the sequence
% +ColInc:			Column value to be incremented each step of the sequence
% +InitialValue:	Initial sequence value from previous accumulations
% -SequenceNo: 		Sequence number of pieces in a row from the given cell and direction.																	
sequence(Piece, Board, SetLine, SetColumn, LineInc, ColInc, InitialValue, SequenceNo) :- 	getPiece(SetLine, SetColumn, Board, Piece),
																							NewLine is SetLine + LineInc,
																							NewColumn is SetColumn + ColInc,
																							NewValue is InitialValue + 1,
																							sequence(Piece, Board, NewLine, NewColumn, LineInc, ColInc, NewValue, SequenceNo).
sequence(_, _, _, _, _, _, SequenceNo, SequenceNo).


% Updates the Sapture Number of the player whose turn is being processed.

% Must be called after the board is updated with the current player's new piece

% +CurrPiece: 		Model ID of the current turn's player piece.
% +NextPiece: 		Model ID of the current player's opponent piece.
% +Board:			Internal Representation of the Board this turn, before being updated with the captures.
% +NewBoard:		Internal Representation of the Board this turn, after being updated with the captures.
% +SetLine:			Line of the cell where the player placed his piece this turn.
% +SetColumn:		Column of the cell where the player placed his piece this turn.
% +CurrCaptureNo: 	Number of captures the current player has before this turn.
% -NewCaptureNo: 	Number of captures the current player has after this turn.
updateCaptures(CurrPiece, NextPiece, Board, NewBoard, SetLine, SetColumn, CurrCaptureNo, NewCaptureNo) :- 	getCaptures(horizontal,  CurrPiece, NextPiece, Board,  Board1, 	 SetLine, SetColumn, HorizontalCaptureNo),
																											getCaptures(vertical, 	 CurrPiece, NextPiece, Board1, Board2, 	 SetLine, SetColumn, VerticalCaptureNo),
																											getCaptures(posDiagonal, CurrPiece, NextPiece, Board2, Board3, 	 SetLine, SetColumn, PosDiagonalCaptureNo),
																											getCaptures(negDiagonal, CurrPiece, NextPiece, Board3, NewBoard, SetLine, SetColumn, NegDiagonalCaptureNo),
																											!,
																											NewCaptureNo is CurrCaptureNo + HorizontalCaptureNo + VerticalCaptureNo + PosDiagonalCaptureNo + NegDiagonalCaptureNo.

% Calculates the Capture Number in a given direction from a given cell.

% +Direction 	Internal Representation of the direction to be evaluated
% +CurrPiece: 	Model ID of the current turn's player piece.
% +NextPiece: 	Model ID of the current player's opponent piece.
% +Board:		Internal Representation of the Board this turn, before being updated with the captures.
% +NewBoard:	Internal Representation of the Board this turn, after being updated with the captures.
% +SetLine:		Line of the cell where captures are being evaluated (Latest cell to be played by current player).
% +SetColumn:	Column of the cell where captures are being evaluated (Latest cell to be played by current player).
% -CaptureNo: 	Number of captures from the given cell and direction.																											
getCaptures(Direction, CurrPiece, NextPiece, Board, NewBoard, SetLine, SetColumn, CaptureNo) :-	direction(Direction, LineInc, ColInc),
																								LineDec is -LineInc, ColDec is -ColInc,
																								capture(CurrPiece, NextPiece, Board,  Board1,   SetLine, SetColumn, LineDec, ColDec, LeftCaptureNo),  % LeftCaptureNo is either 1 or 0.
																								capture(CurrPiece, NextPiece, Board1, NewBoard, SetLine, SetColumn, LineInc, ColInc, RightCaptureNo), % LeftCaptureNo is either 1 or 0.
																								!,
																								CaptureNo is LeftCaptureNo + RightCaptureNo.

% Checks if there was a capture in a given way from a given cell.

% +CurrPiece: 	Model ID of the current turn's player piece.
% +NextPiece: 	Model ID of the current player's opponent piece.
% +Board:		Internal Representation of the Board this turn, before being updated with the captures.
% +NewBoard:	Internal Representation of the Board this turn, after being updated with the captures.
% +Line1:		Line of the the first cell of the capture being evaluated (Corresponds to the latest cell to be played by current player).
% +Column1:		Column of the the first cell of the capture being evaluated (Corresponds to the latest cell to be played by current player).
% -CaptureNo: 	Numeric alue stating if there is a capture (1) or not (0).
capture(CurrPiece, NextPiece, Board, NewBoard, Line1, Column1, LineInc, ColInc, 1) :- 	Line2 is Line1 + LineInc, Column2 is Column1 + ColInc,
																						Line3 is Line2 + LineInc, Column3 is Column2 + ColInc,
																						Line4 is Line3 + LineInc, Column4 is Column3 + ColInc,
																						getPiece(Line1, Column1, Board, CurrPiece),
																						getPiece(Line2, Column2, Board, NextPiece),
																						getPiece(Line3, Column3, Board, NextPiece),
																						getPiece(Line4, Column4, Board, CurrPiece),
																						!,																			
																						setPiece(Line2, Column2, Board,  Board1,   '0'),
																						setPiece(Line3, Column3, Board1, NewBoard, '0'),
																						!.
capture(_, _, Board, Board, _, _, _, _, 0).



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% Board Evaluation (AI) %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% API: 					aiDepth/2, choose_move/7, value/5

% Auxiliary Predicates:	valid_moves/2, minimax/8, analyseMove/8, compareMoves/9


% Corresponds the AI type with its depth (Bigger depth -> Higher Difficulty).

% It fails if the given player is not a valid AI type (i.e. Is a human player).

% Player:	Internal Representation of the Player (AI).
% Depth:	Depth searched by the AI to calculate its move.
aiDepth(player(easyAI, _, _, _),   1).
aiDepth(player(mediumAI, _, _, _), 2).
aiDepth(player(hardAI, _, _, _),   3).


% Computes a best move for a certain game state using the minmax algorithm

% +Board:			Internal Representation of the Board in its current state.
% -BestBoard:		Internal Representation of the Board in its best resulting state.
% +CurrPlayer:		Internal Representation of the Player going to play this turn (AI).
% +NextPlayer:		Internal Representation of the opponent of the Player playing this turn.
% -BestCurrPlayer:	Internal Representation of the Player going to play in this game state after doing the best play.
% +Depth:			Depth of game states to analyze.
% -Score:			Score of the resulting state - Range:[-100, 100].
choose_move(Board, BestBoard, CurrPlayer, NextPlayer, BestCurrPlayer, _, Score) :- 	emptyBoard(Board), !,
																					boardSize(Board, LineSize, ColSize),
																					Line is (LineSize + 1) / 2,
																					Column is (ColSize + 1) / 2, !,
																					move(Board, BestBoard, CurrPlayer, NextPlayer, BestCurrPlayer, integer(Line), integer(Column), Score).																						
choose_move(Board, BestBoard, CurrPlayer, NextPlayer, BestCurrPlayer, Depth, Score) :- 	choose_move(Board, BestBoard, CurrPlayer, NextPlayer, BestCurrPlayer, Depth, _, -100, 100), % Initial values of Alpha and Beta
																						length(Board, Size),
																						value(Size, BestCurrPlayer, NextPlayer, Score).
choose_move(Board, BestBoard, CurrPlayer, NextPlayer, BestCurrPlayer, Depth, Score, Alpha, Beta) :-	valid_moves(Board, MoveList),
																									minimax(Board, BestBoard, MoveList, CurrPlayer, NextPlayer, BestCurrPlayer, Depth, Score, Alpha, Beta).

																		
% Creates a list with the valid moves given the current state of the board
																		
% Since the restrictions of moves are the same for both players, independently of the board state, this doesn't depend on the player executing the move.

% +Board:	Internal Representation of the Board to be evaluated.
% +MoveList	List containing the possible moves to be executed.
valid_moves(Board, MoveList) :- boardSize(Board, LineSize, ColSize),
								valid_moves(Board, MoveList, LineSize, ColSize, ColSize).

% Iterate by Decrementing the Column and Line. Use a separate value to keep track of ColSize so you can reset the Column Number for the next Line.
valid_moves(_, [], 0, _, _).
valid_moves(Board, MoveList, LineSize, ColSize, 0) :- 	DecLine is LineSize - 1,
														valid_moves(Board, MoveList, DecLine, ColSize, ColSize), !.

valid_moves(Board, [move(LineSize, ColNum) | MoveList], LineSize, ColSize, ColNum) :- 	getPiece(LineSize, ColNum, Board, '0'),
																						!,
																						DecColNum is ColNum - 1,
																						valid_moves(Board, MoveList, LineSize, ColSize, DecColNum).
valid_moves(Board, MoveList, LineSize, ColSize, ColNum) :- 	DecColNum is ColNum - 1,
															valid_moves(Board, MoveList, LineSize, ColSize, DecColNum).
															
% Minmax algorithm for finding the best move for a player

% +Board:			Internal Representation of the Board in its current state.
% -BestBoard:		Internal Representation of the Board in its best resulting state.
% +MoveList:		List of moves that can be chosen for this layer.
% +CurrPlayer:		Internal Representation of the Player going to play in this game state before playing.
% +NextPlayer:		Internal Representation of the opponent of the Player playing in this game state.
% -BestCurrPlayer:	Internal Representation of the Player going to play in this game state after doing the best play.
% +Depth:			Depth of game states to analyze.
% -BestScore:		Score of the best resulting state - Range:[-100, 100].

% Initialize with accumulators (Necessary to detect Alpha-Beta Cuts).
minimax(Board, BestBoard, MoveList, CurrPlayer, NextPlayer, BestCurrPlayer, Depth, BestScore, Alpha, Beta) :- 	minimax(Board, BestBoard, _, MoveList, CurrPlayer, NextPlayer, BestCurrPlayer, _, Depth, BestScore, -101, Alpha, Beta).

minimax(_	 , BestBoard, BestBoard, []		 , _		 , _		 , BestCurrPlayer, BestCurrPlayer, _	, BestScore, BestScore, _	 , _).
minimax(Board, BestBoard, AccBoard,  [M | MS], CurrPlayer, NextPlayer, BestCurrPlayer, AccCurrPlayer,  Depth, BestScore, AccScore,  Alpha, Beta) :- 
																												analyseMove(Board, NewBoard1, M, CurrPlayer, NextPlayer, NewCurrPlayer1, Depth, NewScore1, Alpha, Beta),
																												compareMoves(	NewBoard1, NewCurrPlayer1, NewScore1, 
																																AccBoard,  AccCurrPlayer,  AccScore,
																																MaxBoard,  MaxCurrPlayer,  MaxScore),
																												!,
																												max(NewAlpha, [Alpha, MaxScore]),
																												pruning(Board, BestBoard, MaxBoard, MS, CurrPlayer, NextPlayer, BestCurrPlayer, MaxCurrPlayer, Depth, BestScore, MaxScore, NewAlpha, Beta).
																						

pruning(_, MaxBoard, MaxBoard, _, _, _, MaxCurrPlayer, MaxCurrPlayer, _, MaxScore, MaxScore, Alpha, Beta) :- Alpha >= Beta, !. % No need to keep processing the tree, we can stop here.
																						
pruning(Board, BestBoard, MaxBoard, MS, CurrPlayer, NextPlayer, BestCurrPlayer, MaxCurrPlayer, Depth, BestScore, MaxScore, Alpha, Beta) :- !,			
			minimax(Board, BestBoard, MaxBoard, MS, CurrPlayer, NextPlayer, BestCurrPlayer, MaxCurrPlayer, Depth, BestScore, MaxScore, Alpha, Beta).																						

% Analyses a move.

% Depending on the depth of choices to consider, choose_move is called recursively

% +Board:			Internal Representation of the Board in its current state.
% -NewBoard:		Internal Representation of the Board in its resulting state.
% +Move:			Move to be applied.
% +CurrPlayer:		Internal Representation of the Player going to play in this game state before playing.
% +NextPlayer:		Internal Representation of the opponent of the Player playing in this game state.
% -NewCurrPlayer:	Internal Representation of the Player going to play in this game state after playing.
% +Depth:			Depth of game states to analyze.
% -Score:			Score of the resulting state - Range:[-100, 100].
analyseMove(Board, NewBoard, move(Line, Column), CurrPlayer, NextPlayer, NewCurrPlayer, 0, 	Score, _, _)		:- !, move(Board, NewBoard, CurrPlayer, NextPlayer, NewCurrPlayer, Line, Column, Score). % Board step inherently calls value.
analyseMove(Board, NewBoard, move(Line, Column), CurrPlayer, NextPlayer, NewCurrPlayer, Depth, Score, Alpha, Beta)	:- 	move(Board, NewBoard, CurrPlayer, NextPlayer, NewCurrPlayer, Line, Column, _),
																														DecDepth is Depth - 1, !,
																														% Due to the nature of the value function, we can simply swap the players and negate its maximum score to get the minimum.
																														% The same applies to the Alpha and Beta values (The minimizing player becomes the maximizing player).
																														NegAlpha is -Beta,
																														NegBeta is -Alpha,
																														choose_move(NewBoard, _, NextPlayer, NewCurrPlayer, _, DecDepth, NegScore, NegAlpha, NegBeta),
																														Score is -NegScore.
						
% Compares two game states (Part of MinMax algorithm)

% +NewBoard1:		Internal Representation of the Board in the first state.
% +NewCurrPlayer1:	Internal Representation of the Player in the first state.
% +NewScore1:		Score of the first state - Range: [-100, 100].

% +NewBoard2:		Internal Representation of the Board in the second state.
% +NewCurrPlayer2:	Internal Representation of the Player in the second state.
% +NewScore2:		Score of the second state - Range: [-100, 100].

% -BestBoard:		Internal Representation of the best of both boards.
% -BestCurrPlayer:	Internal Representation of the Player in the best of both states.
% -BestScore:		Score of the best of both states - Range: [-100, 100].
compareMoves(NewBoard1, NewCurrPlayer1, NewScore1, _, _, NewScore2, NewBoard1, NewCurrPlayer1, NewScore1) :- NewScore1 > NewScore2, !.
compareMoves(_, _, _, NewBoard2, NewCurrPlayer2, NewScore2, NewBoard2, NewCurrPlayer2, NewScore2).

													

% Computes the score of a game state to quantify how well the game is for a player

% +Size:            Board size
% +CurrCaptureNo:	Number of captures by the current turn's player.
% +CurrSequenceNo:	Number of pieces in a row the current turn's player has.
% +NextCaptureNo:	Number of captures by the current player's opponent.
% +NextSequenceNo:	Number of pieces in a row the current player's opponent has.
% -Score:			Score attributed to the game state in the interval [-100, 100], where a maximal score represents a better state for the current player.	
value(Size, _, _, NextCaptureNo, NextSequenceNo, -100) :-	winning_conditions(Size, WinCaptureNo, WinSequenceNo),
															(NextCaptureNo >= WinCaptureNo ; NextSequenceNo >= WinSequenceNo). % Must come first, otherwise AI may think it won when progressing through the tree when it lost before.
value(Size, CurrCaptureNo, CurrSequenceNo, _, _, 100)	 :-	winning_conditions(Size, WinCaptureNo, WinSequenceNo),
															(CurrCaptureNo >= WinCaptureNo ; CurrSequenceNo >= WinSequenceNo).
value(_, CurrCaptureNo, CurrSequenceNo, NextCaptureNo, NextSequenceNo, Score) 	:-	Score = CurrCaptureNo - NextCaptureNo + CurrSequenceNo - NextSequenceNo .

value(Size, player(_, _, CurrCaptureNo, CurrSequenceNo), player(_, _, NextCaptureNo, NextSequenceNo), Score) :- value(Size, CurrCaptureNo, CurrSequenceNo, NextCaptureNo, NextSequenceNo, Score).