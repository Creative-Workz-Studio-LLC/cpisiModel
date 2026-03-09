-- #!omni:code --lean
-- ╠═==================================================================================================================═╣
-- [S-theorem-lean-04] Axiom 04: The Provision (Manna)
-- =====================================================================================================================

def Manna (t : Nat) (req : Nat) : Prop := t = req

theorem provision_is_precise : ∀ t req : Nat, Manna t req → t = req :=
by intros t req h; exact h

#print "--- WITNESS DECLARATION: LOGICAL MANNA ---"
#print "Axiom Injected: 04"
#print "Logical Alignment Verified: true"
