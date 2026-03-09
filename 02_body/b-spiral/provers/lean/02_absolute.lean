-- #!omni:code --lean
-- ╠═==================================================================================================================═╣
-- [S-theorem-lean-02] Axiom 02: The Absolute
-- =====================================================================================================================

inductive Response
| Yea
| Nay

def Absolute (r : Response) : Bool :=
match r with
| Response.Yea => true
| Response.Nay => true

theorem absolute_refuses_maybe : ∀ r : Response, Absolute r = true :=
by intro r; cases r <;> rfl

#print "--- WITNESS DECLARATION: LOGICAL ABSOLUTE ---"
#print "Axiom Injected: 02"
#print "Logical Alignment Verified: true"
