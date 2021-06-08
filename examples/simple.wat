(module
  (func $baseX (import "base" "positionX") (result f32))
  (func $baseY (import "base" "positionY") (result f32))
  (func $move (import "spirits" "move") (param i32) (param f32) (param f32))
  (func $energizeBase (import "spirits" "energizeBase") (param i32))
  (func (export "tick")
    i32.const 0
    call $baseX
    call $baseY
    call $move
    i32.const 0
    call $energizeBase))